import {
	EmergenciesObject,
	ProjectSummaryObject,
	SectorBeneficiaryObject,
	projectSummaryObjectSchema,
	sectorBeneficiaryObjectSchema,
	emergenciesObjectSchema,
	cvaObjectSchema,
	CvaObject,
} from "./schemas";
import { List } from "./makelists";
import warnInvalidSchema, { warnProjectNotFound } from "./warninvalid";
import constants from "./constants";

const { beneficiariesSplitOrder, beneficiaryCategories, reportTypes } =
	constants;

export type Datum = {
	reached: BeneficiariesObject;
	targeted: BeneficiariesObject;
	reachedByBeneficiaryType: BeneficiaryTypes;
	targetedByBeneficiaryType: BeneficiaryTypes;
	disabledReached: BeneficiariesObject;
	disabledTargeted: BeneficiariesObject;
	fund: number;
	year: number;
	projectCode: string;
	projectId: number;
	allocationSource: number;
	organizationType: number;
	organizationId: number;
	allocationType: number;
	allocationTypeId: number;
	endDate: Date;
	approvalDate: Date;
	budget: number;
	budgetGBVPlanned: number;
	budgetGBVReached: number;
	targetedGBV: number;
	reachedGBV: number;
	projectStatus: string;
	projectStatusId: number;
	sectorData: SectorDatum[];
	reportType: ReportType;
	emergenciesData: EmergencyDatum[];
	cvaData: CvaDatum[] | null;
	cvaTotalTargetedPeople: number | null;
	cvaTotalReachedPeople: number | null;
};

export type ReportType = (typeof reportTypes)[number];

export type Data = Datum[];

type SectorDatum = {
	sectorId: number;
	percentage: number;
	reached: BeneficiariesObject;
	targeted: BeneficiariesObject;
};

type CvaDatum = {
	cvaId: number;
	organizationTypeId: number;
	sectorId: number;
	targetedPeople: number;
	reachedPeople: number;
	targetedAllocations: number;
	reachedAllocations: number;
};

type SectorMapValue = {
	projectCode: string;
	projectId: number;
	sectors: SectorDatum[];
};

type CvaMapValue = {
	projectCode: string;
	projectId: number;
	cva: CvaDatum[];
};

type EmergencyDatum = {
	emergencyId: number;
	percentage: number;
};

type BeneficiaryTypes = {
	[K in (typeof beneficiariesSplitOrder)[number]]: BeneficiariesObject;
};

export type GenderAndAge = (typeof beneficiaryCategories)[number];

export type BeneficiariesObject = {
	[K in GenderAndAge]: number;
};

export type InDataLists = {
	years: Set<number>;
	sectors: Set<number>;
	allocationTypes: Set<number>;
	allocationSources: Set<number>;
	funds: Set<number>;
	organizationTypes: Set<number>;
	organizations: Set<number>;
};

type SetType<T> = {
	[P in keyof T]: T[P] extends Set<infer U> ? U : never;
};

type InDataListsValues = SetType<InDataLists>;

type ProcessRawDataParams = {
	projectSummary: ProjectSummaryObject[];
	sectorsData: SectorBeneficiaryObject[];
	emergenciesData: EmergenciesObject[];
	cvaData: CvaObject[];
	listsObj: List;
	setInDataLists: React.Dispatch<React.SetStateAction<InDataLists>>;
};

function processRawData({
	projectSummary,
	sectorsData,
	emergenciesData,
	cvaData,
	listsObj,
	setInDataLists,
}: ProcessRawDataParams): Data {
	const data: Data = [];
	const sectorsDataMap: Map<string, SectorMapValue> = new Map();
	const emergenciesDataMap: Map<number, EmergencyDatum[]> = new Map();
	const cvaDataMap: Map<string, CvaMapValue> = new Map();

	const yearsSet: Set<InDataListsValues["years"]> = new Set();
	const sectorsSet: Set<InDataListsValues["sectors"]> = new Set();
	const allocationTypesSet: Set<InDataListsValues["allocationTypes"]> =
		new Set();
	const allocationSourcesSet: Set<InDataListsValues["allocationSources"]> =
		new Set();
	const fundsSet: Set<InDataListsValues["funds"]> = new Set();
	const organizationTypesSet: Set<InDataListsValues["organizationTypes"]> =
		new Set();
	const organizationsSet: Set<InDataListsValues["organizations"]> = new Set();

	sectorsData.forEach(row => {
		const parsedRow = sectorBeneficiaryObjectSchema.safeParse(row);
		if (parsedRow.success) {
			sectorsSet.add(row.GlobalClusterId);
			if (!sectorsDataMap.has(row.ChfProjectCode)) {
				sectorsDataMap.set(row.ChfProjectCode, {
					projectCode: row.ChfProjectCode,
					projectId: row.ChfId,
					sectors: [
						{
							sectorId: row.GlobalClusterId,
							percentage: row.Percentage,
							reached: {
								girls: row.ActualGirls || 0,
								boys: row.ActualBoys || 0,
								women: row.ActualWomen || 0,
								men: row.ActualMen || 0,
							},
							targeted: {
								girls: row.TargetGirls || 0,
								boys: row.TargetBoys || 0,
								women: row.TargetWomen || 0,
								men: row.TargetMen || 0,
							},
						},
					],
				});
			} else {
				const projectData = sectorsDataMap.get(row.ChfProjectCode);
				if (projectData) {
					projectData.sectors.push({
						sectorId: row.GlobalClusterId,
						percentage: row.Percentage,
						reached: {
							girls: row.ActualGirls || 0,
							boys: row.ActualBoys || 0,
							women: row.ActualWomen || 0,
							men: row.ActualMen || 0,
						},
						targeted: {
							girls: row.TargetGirls || 0,
							boys: row.TargetBoys || 0,
							women: row.TargetWomen || 0,
							men: row.TargetMen || 0,
						},
					});
				} else {
					warnProjectNotFound(
						row.ChfProjectCode,
						row,
						"Project not found in sectorsDataMap"
					);
				}
			}
		} else {
			warnInvalidSchema(
				"sectorsData",
				row,
				JSON.stringify(parsedRow.error)
			);
		}
	});

	cvaData.forEach(row => {
		const parsedRow = cvaObjectSchema.safeParse(row);
		if (parsedRow.success) {
			if (!cvaDataMap.has(row.CHFProjectCode)) {
				cvaDataMap.set(row.CHFProjectCode, {
					projectCode: row.CHFProjectCode,
					projectId: row.CHFId,
					cva: [
						{
							cvaId: row.CVATypeId,
							organizationTypeId: row.OrganizationTypeId,
							sectorId: row.ClusterId,
							targetedPeople: row.PeopleTargeted,
							reachedPeople: row.PeopleReached,
							targetedAllocations: row.TargetedTransferAmt,
							reachedAllocations: row.ReachedTransferAmt,
						},
					],
				});
			} else {
				const projectData = cvaDataMap.get(row.CHFProjectCode);
				if (projectData) {
					projectData.cva.push({
						cvaId: row.CVATypeId,
						organizationTypeId: row.OrganizationTypeId,
						sectorId: row.ClusterId,
						targetedPeople: row.PeopleTargeted,
						reachedPeople: row.PeopleReached,
						targetedAllocations: row.TargetedTransferAmt,
						reachedAllocations: row.ReachedTransferAmt,
					});
				} else {
					warnProjectNotFound(
						row.CHFProjectCode,
						row,
						"Project not found in cvaDataMap"
					);
				}
			}
		} else {
			warnInvalidSchema("cvaData", row, JSON.stringify(parsedRow.error));
		}
	});

	emergenciesData.forEach(row => {
		const parsedRow = emergenciesObjectSchema.safeParse(row);
		if (parsedRow.success) {
			if (!emergenciesDataMap.has(row.CHFId)) {
				emergenciesDataMap.set(row.CHFId, [
					{
						emergencyId: row.EmergencyTypeId,
						percentage: row.EmergencyPercent,
					},
				]);
			} else {
				const emergencyData = emergenciesDataMap.get(row.CHFId);
				if (emergencyData) {
					emergencyData.push({
						emergencyId: row.EmergencyTypeId,
						percentage: row.EmergencyPercent,
					});
				} else {
					warnProjectNotFound(
						row.CHFId.toString(),
						row,
						"Emergency not found in emergenciesDataMap"
					);
				}
			}
		} else {
			warnInvalidSchema(
				"emergenciesData",
				row,
				JSON.stringify(parsedRow.error)
			);
		}
	});

	projectSummary.forEach(row => {
		const parsedRow = projectSummaryObjectSchema.safeParse(row);
		if (parsedRow.success) {
			const thisAllocationType =
				listsObj.allocationTypesCompleteList[
					parseFloat(`${row.PooledFundId}.${row.AllocationtypeId}`)
				];
			const thisOrganization =
				listsObj.organizationsCompleteList[row.GlobalUniqueOrgId];
			const thisStatus = listsObj.statuses[row.GlbPrjStatusId];
			const thisSectorData = sectorsDataMap.get(row.ChfProjectCode);
			const thisEmergenciesData = emergenciesDataMap.get(row.ChfId);
			const thisCvaData = cvaDataMap.get(row.ChfProjectCode);

			if (!thisAllocationType) {
				warnProjectNotFound(
					row.ChfProjectCode,
					row,
					"Project not found in allocation types"
				);
			}

			if (!thisOrganization) {
				warnProjectNotFound(
					row.ChfProjectCode,
					row,
					"Project not found in organizations"
				);
			}

			if (!thisStatus) {
				warnProjectNotFound(
					row.ChfProjectCode,
					row,
					"Project not found in statuses"
				);
			}

			if (!thisSectorData) {
				warnProjectNotFound(
					row.ChfProjectCode,
					row,
					"Project not found in sectors data"
				);
			}

			//In case we need to check what projects are missing from emergencies data
			// if (!thisEmergenciesData) {
			// 	warnProjectNotFound(
			// 		row.ChfProjectCode,
			// 		row,
			// 		"Project not found in emergencies data"
			// 	);
			// }

			if (
				thisAllocationType &&
				thisOrganization &&
				thisStatus &&
				thisSectorData
			) {
				yearsSet.add(thisAllocationType.AllocationYear);
				fundsSet.add(row.PooledFundId);
				allocationSourcesSet.add(thisAllocationType.AllocationSourceId);
				organizationTypesSet.add(thisOrganization.OrganizationTypeId);
				organizationsSet.add(thisOrganization.GlobalUniqueId);
				allocationTypesSet.add(
					parseFloat(`${row.PooledFundId}.${row.AllocationtypeId}`)
				);

				listsObj.projectDetails.set(row.ChfId, {
					year: thisAllocationType.AllocationYear,
					fund: row.PooledFundId,
					allocationSource: thisAllocationType.AllocationSourceId,
					allocationType: parseFloat(
						`${row.PooledFundId}.${row.AllocationtypeId}`
					),
					endDate: new Date(row.EndDate),
					approvalDate: new Date(row.PrjApprDate),
					projectStatusId: row.GlbPrjStatusId,
					reportType: row.RptCode ?? 0,
				});

				const reachedByBeneficiaryType: BeneficiaryTypes =
					generateBeneficiariesSplitObject(row, "Ach");
				const targetedByBeneficiaryType: BeneficiaryTypes =
					generateBeneficiariesSplitObject(row, "Ben");

				const objDatum: Datum = {
					fund: row.PooledFundId,
					year: thisAllocationType.AllocationYear,
					projectCode: row.ChfProjectCode,
					projectId: row.ChfId,
					allocationSource: thisAllocationType.AllocationSourceId,
					organizationType: thisOrganization.OrganizationTypeId,
					organizationId: thisOrganization.GlobalUniqueId,
					allocationType: parseFloat(
						`${row.PooledFundId}.${row.AllocationtypeId}`
					),
					allocationTypeId: row.AllocationtypeId,
					endDate: new Date(row.EndDate),
					approvalDate: new Date(row.PrjApprDate),
					budget: row.Budget,
					projectStatus: thisStatus,
					projectStatusId: row.GlbPrjStatusId,
					sectorData: thisSectorData.sectors,
					emergenciesData: thisEmergenciesData ?? [],
					reached: generateBeneficiariesObjectSummary(row, "reached"),
					targeted: generateBeneficiariesObjectSummary(
						row,
						"targeted"
					),
					disabledReached: generateBeneficiariesObjectSummary(
						row,
						"disabledReached"
					),
					disabledTargeted: generateBeneficiariesObjectSummary(
						row,
						"disabledTargeted"
					),
					reachedByBeneficiaryType,
					targetedByBeneficiaryType,
					budgetGBVPlanned: row.GBVBudget || 0,
					budgetGBVReached: row.AchGBVBudget || 0,
					targetedGBV: row.GBVPeopleTgt || 0,
					reachedGBV: row.AchGBVPeople || 0,
					reportType: row.RptCode ?? 0,
					cvaData: thisCvaData ? thisCvaData.cva : null,
					cvaTotalTargetedPeople: row.CVATotPeople,
					cvaTotalReachedPeople: row.AchCVATotPeople,
				};

				data.push(objDatum);
			}
		} else {
			warnInvalidSchema(
				"projectSummary",
				row,
				JSON.stringify(parsedRow.error)
			);
		}
	});

	setInDataLists(() => ({
		years: yearsSet,
		sectors: sectorsSet,
		allocationTypes: allocationTypesSet,
		allocationSources: allocationSourcesSet,
		funds: fundsSet,
		organizationTypes: organizationTypesSet,
		organizations: organizationsSet,
	}));

	return data;
}

function generateBeneficiariesSplitObject(
	row: ProjectSummaryObject,
	type: "Ach" | "Ben"
): BeneficiaryTypes {
	const zeroSplit = [0, 0, 0, 0, 0];
	const girlsColumn = row[`${type}GSplit`],
		boysColumn = row[`${type}BSplit`],
		womenColumn = row[`${type}WSplit`],
		menColumn = row[`${type}MSplit`];

	const girlsSplit =
		girlsColumn !== null ? girlsColumn.split("|").map(Number) : zeroSplit;

	const boysSplit =
		boysColumn !== null ? boysColumn.split("|").map(Number) : zeroSplit;

	const womenSplit =
		womenColumn !== null ? womenColumn.split("|").map(Number) : zeroSplit;

	const menSplit =
		menColumn !== null ? menColumn.split("|").map(Number) : zeroSplit;

	const splitObj = {} as BeneficiaryTypes;

	beneficiariesSplitOrder.forEach((type, index) => {
		splitObj[type] = {
			girls: girlsSplit[index],
			boys: boysSplit[index],
			women: womenSplit[index],
			men: menSplit[index],
		};
	});

	return splitObj;
}

function generateBeneficiariesObjectSummary(
	row: ProjectSummaryObject,
	type: "reached" | "targeted" | "disabledReached" | "disabledTargeted"
): BeneficiariesObject {
	let girls = 0,
		boys = 0,
		women = 0,
		men = 0;

	if (type === "reached") {
		girls = row.AchG || 0;
		boys = row.AchB || 0;
		women = row.AchW || 0;
		men = row.AchM || 0;
	}

	if (type === "targeted") {
		girls = row.BenG || 0;
		boys = row.BenB || 0;
		women = row.BenW || 0;
		men = row.BenM || 0;
	}

	if (type === "disabledReached") {
		girls = row.AchDisabledG || 0;
		boys = row.AchDisabledB || 0;
		women = row.AchDisabledW || 0;
		men = row.AchDisabledM || 0;
	}

	if (type === "disabledTargeted") {
		girls = row.DisabledG || 0;
		boys = row.DisabledB || 0;
		women = row.DisabledW || 0;
		men = row.DisabledM || 0;
	}

	return {
		girls,
		boys,
		women,
		men,
	};
}

export default processRawData;
