import {
	EmergenciesObject,
	ProjectSummaryObject,
	SectorBeneficiaryObject,
	projectSummaryObjectSchema,
	sectorBeneficiaryObjectSchema,
	emergenciesObjectSchema,
	cvaObjectSchema,
	CvaObject,
	TotalBeneficiariesObject,
	TotalBeneficiariesByPartnerObject,
	TotalBeneficiariesBySectorObject,
	TotalBeneficiariesByBeneficiaryTypeObject,
	totalBeneficiariesObjectSchema,
	totalBeneficiariesByPartnerObjectSchema,
	totalBeneficiariesBySectorObjectSchema,
	totalBeneficiariesByBeneficiaryTypeObjectSchema,
} from "./schemas";
import { List } from "./makelists";
import warnInvalidSchema, { warnProjectNotFound } from "./warninvalid";
import constants, { projectStatusMapping } from "./constants";

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
	fundsPerBeneficiaryType: { [beneficiaryType: number]: Set<number> };
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
	totalBeneficiaries: TotalBeneficiariesObject[];
	totalBeneficiariesByPartner: TotalBeneficiariesByPartnerObject[];
	totalBeneficiariesBySector: TotalBeneficiariesBySectorObject[];
	totalBeneficiariesByBeneficiaryType: TotalBeneficiariesByBeneficiaryTypeObject[];
	totalBeneficiariesByDisability: TotalBeneficiariesObject[];
};

type TargetedAndReached = {
	targeted: number;
	reached: number;
};

export type TotalBeneficiariesBreakdown = {
	[key in GenderAndAge | "total"]: TargetedAndReached;
};

export type TotalBeneficiariesData = {
	[year: number]: {
		[fund: number]: {
			[status: number]: TotalBeneficiariesBreakdown;
			all: TotalBeneficiariesBreakdown;
		};
	};
};

type TotalBeneficiariesByPartnerBreakdown = {
	[key in GenderAndAge]: TargetedAndReached;
} & {
	partner: number;
};

export type TotalBeneficiariesByPartnerData = {
	[year: number]: {
		[fund: number]: {
			[status: number]: TotalBeneficiariesByPartnerBreakdown[];
			all: TotalBeneficiariesByPartnerBreakdown[];
		};
	};
};

type TotalBeneficiariesBySectorBreakdown = {
	[key in GenderAndAge]: TargetedAndReached;
} & {
	sector: number;
};

export type TotalBeneficiariesBySectorData = {
	[year: number]: {
		[fund: number]: {
			[status: number]: TotalBeneficiariesBySectorBreakdown[];
			all: TotalBeneficiariesBySectorBreakdown[];
		};
	};
};

export type TotalBeneficiariesByBeneficiaryTypeBreakdown = {
	[key in GenderAndAge]: TargetedAndReached;
} & {
	beneficiaryType: number;
};

export type TotalBeneficiariesByBeneficiaryTypeData = {
	[year: number]: {
		[fund: number]: {
			[status: number]: TotalBeneficiariesByBeneficiaryTypeBreakdown[];
			all: TotalBeneficiariesByBeneficiaryTypeBreakdown[];
		};
	};
};

function processRawData({
	projectSummary,
	sectorsData,
	emergenciesData,
	cvaData,
	listsObj,
	setInDataLists,
	totalBeneficiaries,
	totalBeneficiariesByPartner,
	totalBeneficiariesBySector,
	totalBeneficiariesByBeneficiaryType,
	totalBeneficiariesByDisability,
}: ProcessRawDataParams): {
	data: Data;
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	totalBeneficiariesByBeneficiaryTypeData: TotalBeneficiariesByBeneficiaryTypeData;
	totalBeneficiariesByDisabilityData: TotalBeneficiariesData;
} {
	const data: Data = [];
	const totalBeneficiariesData: TotalBeneficiariesData = {};
	const totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData = {};
	const totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData = {};
	const totalBeneficiariesByBeneficiaryTypeData: TotalBeneficiariesByBeneficiaryTypeData =
		{};
	const totalBeneficiariesByDisabilityData: TotalBeneficiariesData = {};

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
	const fundsPerBeneficiaryType: InDataLists["fundsPerBeneficiaryType"] = {};

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
					const foundSector = projectData.sectors.find(
						sector => sector.sectorId === row.GlobalClusterId,
					);
					if (!foundSector) {
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
						foundSector.percentage += row.Percentage;
						foundSector.reached.girls += row.ActualGirls || 0;
						foundSector.reached.boys += row.ActualBoys || 0;
						foundSector.reached.women += row.ActualWomen || 0;
						foundSector.reached.men += row.ActualMen || 0;
						foundSector.targeted.girls += row.TargetGirls || 0;
						foundSector.targeted.boys += row.TargetBoys || 0;
						foundSector.targeted.women += row.TargetWomen || 0;
						foundSector.targeted.men += row.TargetMen || 0;
					}
				} else {
					warnProjectNotFound(
						row.ChfProjectCode,
						row,
						"Project not found in sectorsDataMap",
					);
				}
			}
		} else {
			warnInvalidSchema(
				"sectorsData",
				row,
				JSON.stringify(parsedRow.error),
			);
		}
	});

	cvaData.forEach(row => {
		const parsedRow = cvaObjectSchema.safeParse(row);
		if (parsedRow.success) {
			if (!cvaDataMap.has(row.ChfProjectCode)) {
				cvaDataMap.set(row.ChfProjectCode, {
					projectCode: row.ChfProjectCode,
					projectId: row.CHFId,
					cva: [
						{
							cvaId: row.CVATypeId,
							organizationTypeId: row.OrganizationTypeId,
							sectorId: row.GlobalClusterId,
							targetedPeople: row.PeopleTargeted ?? 0,
							reachedPeople: row.PeopleReached ?? 0,
							targetedAllocations: row.TransferAmount ?? 0,
							reachedAllocations: row.TotalAmtTransferred ?? 0,
						},
					],
				});
			} else {
				const projectData = cvaDataMap.get(row.ChfProjectCode);
				if (projectData) {
					projectData.cva.push({
						cvaId: row.CVATypeId,
						organizationTypeId: row.OrganizationTypeId,
						sectorId: row.GlobalClusterId,
						targetedPeople: row.PeopleTargeted ?? 0,
						reachedPeople: row.PeopleReached ?? 0,
						targetedAllocations: row.TransferAmount ?? 0,
						reachedAllocations: row.TotalAmtTransferred ?? 0,
					});
				} else {
					warnProjectNotFound(
						row.ChfProjectCode,
						row,
						"Project not found in cvaDataMap",
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
						"Emergency not found in emergenciesDataMap",
					);
				}
			}
		} else {
			warnInvalidSchema(
				"emergenciesData",
				row,
				JSON.stringify(parsedRow.error),
			);
		}
	});

	populateTotalBeneficiariesData(
		totalBeneficiaries,
		totalBeneficiariesData,
		"totalBeneficiaries",
	);

	populateTotalBeneficiariesByPartnerData(
		totalBeneficiariesByPartner,
		totalBeneficiariesByPartnerData,
		"totalBeneficiariesByPartner",
	);

	populateTotalBeneficiariesBySectorData(
		totalBeneficiariesBySector,
		totalBeneficiariesBySectorData,
		"totalBeneficiariesBySector",
	);

	populateTotalBeneficiariesByBeneficiaryTypeData(
		totalBeneficiariesByBeneficiaryType,
		totalBeneficiariesByBeneficiaryTypeData,
		"totalBeneficiariesByBeneficiaryType",
		fundsPerBeneficiaryType,
	);

	populateTotalBeneficiariesData(
		totalBeneficiariesByDisability,
		totalBeneficiariesByDisabilityData,
		"totalBeneficiariesByDisability",
	);

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
					"Project not found in allocation types",
				);
			}

			if (!thisOrganization) {
				warnProjectNotFound(
					row.ChfProjectCode,
					row,
					"Project not found in organizations",
				);
			}

			if (!thisStatus) {
				warnProjectNotFound(
					row.ChfProjectCode,
					row,
					"Project not found in statuses",
				);
			}

			if (!thisSectorData) {
				warnProjectNotFound(
					row.ChfProjectCode,
					row,
					"Project not found in sectors data",
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
					parseFloat(`${row.PooledFundId}.${row.AllocationtypeId}`),
				);

				listsObj.projectDetails.set(row.ChfId, {
					year: thisAllocationType.AllocationYear,
					fund: row.PooledFundId,
					allocationSource: thisAllocationType.AllocationSourceId,
					allocationType: parseFloat(
						`${row.PooledFundId}.${row.AllocationtypeId}`,
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
						`${row.PooledFundId}.${row.AllocationtypeId}`,
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
						"targeted",
					),
					disabledReached: generateBeneficiariesObjectSummary(
						row,
						"disabledReached",
					),
					disabledTargeted: generateBeneficiariesObjectSummary(
						row,
						"disabledTargeted",
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
				JSON.stringify(parsedRow.error),
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
		fundsPerBeneficiaryType: fundsPerBeneficiaryType,
	}));

	return {
		data,
		totalBeneficiariesData,
		totalBeneficiariesByPartnerData,
		totalBeneficiariesBySectorData,
		totalBeneficiariesByBeneficiaryTypeData,
		totalBeneficiariesByDisabilityData,
	};
}

function generateBeneficiariesSplitObject(
	row: ProjectSummaryObject,
	type: "Ach" | "Ben",
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
	type: "reached" | "targeted" | "disabledReached" | "disabledTargeted",
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

function populateTotalBeneficiariesData(
	source: TotalBeneficiariesObject[],
	target: TotalBeneficiariesData,
	sourceName: string,
) {
	source.forEach(row => {
		const parsedRow = totalBeneficiariesObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			warnInvalidSchema(sourceName, row, parsedRow.error.message);
			return;
		}
		const year = row.ImplementationYear;
		const fund = row.PFId;

		if (!target[year]) {
			target[year] = {};
		}
		if (!target[year][fund]) {
			target[year][fund] = {} as TotalBeneficiariesData[number][number];
		}

		const totalDatum = {
			girls: {
				targeted: row.BenG || 0,
				reached: row.AchG || 0,
			},
			boys: {
				targeted: row.BenB || 0,
				reached: row.AchB || 0,
			},
			women: {
				targeted: row.BenW || 0,
				reached: row.AchW || 0,
			},
			men: {
				targeted: row.BenM || 0,
				reached: row.AchM || 0,
			},
			total: {
				targeted: row.TotTarg || 0,
				reached: row.TotAch || 0,
			},
		};

		if (row.ProcessStatusId == null) {
			target[year][fund].all = totalDatum;
		} else {
			//several raw statuses can map to the same status (e.g. Disbursement
			//and Implementation both map to Under Implementation): add their values
			const thisStatus = projectStatusMapping[row.ProcessStatusId];
			if (!target[year][fund][thisStatus]) {
				target[year][fund][thisStatus] = totalDatum;
			} else {
				addTargetedAndReached(
					target[year][fund][thisStatus],
					totalDatum,
					[...beneficiaryCategories, "total"],
				);
			}
		}
	});

	Object.values(target).forEach(yearData => {
		Object.values(yearData).forEach(fundData => {
			Object.entries(fundData).forEach(([status, statusData]) => {
				if (status !== "all" && fundData.all) {
					capTargetedAndReached(statusData, fundData.all, [
						...beneficiaryCategories,
						"total",
					]);
				}
			});
		});
	});
}

function populateTotalBeneficiariesByPartnerData(
	source: TotalBeneficiariesByPartnerObject[],
	target: TotalBeneficiariesByPartnerData,
	sourceName: string,
) {
	source.forEach(row => {
		const parsedRow =
			totalBeneficiariesByPartnerObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			warnInvalidSchema(sourceName, row, parsedRow.error.message);
			return;
		}
		const year = row.ImplementationYear;
		const fund = row.PFId;

		if (!target[year]) {
			target[year] = {};
		}
		if (!target[year][fund]) {
			target[year][fund] =
				{} as TotalBeneficiariesByPartnerData[number][number];
		}

		const partnersDatum: TotalBeneficiariesByPartnerBreakdown = {
			partner: row.PartnerTypeId,
			girls: {
				targeted: row.BenG || 0,
				reached: row.AchG || 0,
			},
			boys: {
				targeted: row.BenB || 0,
				reached: row.AchB || 0,
			},
			women: {
				targeted: row.BenW || 0,
				reached: row.AchW || 0,
			},
			men: {
				targeted: row.BenM || 0,
				reached: row.AchM || 0,
			},
		};

		if (row.ProcessStatusId === null) {
			if (!target[year][fund].all) {
				target[year][fund].all = [partnersDatum];
			} else {
				target[year][fund].all.push(partnersDatum);
			}
		} else {
			//several raw statuses can map to the same status (e.g. Disbursement
			//and Implementation both map to Under Implementation): add their values
			const thisStatus = projectStatusMapping[row.ProcessStatusId];
			const foundDatum = target[year][fund][thisStatus]?.find(
				d => d.partner === partnersDatum.partner,
			);
			if (foundDatum) {
				addTargetedAndReached(
					foundDatum,
					partnersDatum,
					beneficiaryCategories,
				);
			} else {
				(target[year][fund][thisStatus] ??= []).push(partnersDatum);
			}
		}
	});

	Object.values(target).forEach(yearData => {
		Object.values(yearData).forEach(fundData => {
			Object.entries(fundData).forEach(([status, statusData]) => {
				if (status === "all") return;
				statusData.forEach(datum => {
					const allDatum = fundData.all?.find(
						d => d.partner === datum.partner,
					);
					if (allDatum) {
						capTargetedAndReached(
							datum,
							allDatum,
							beneficiaryCategories,
						);
					}
				});
			});
		});
	});
}

function populateTotalBeneficiariesBySectorData(
	source: TotalBeneficiariesBySectorObject[],
	target: TotalBeneficiariesBySectorData,
	sourceName: string,
) {
	source.forEach(row => {
		const parsedRow = totalBeneficiariesBySectorObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			warnInvalidSchema(sourceName, row, parsedRow.error.message);
			return;
		}

		const year = row.ImplementationYear;
		const fund = row.PFId;

		if (!target[year]) {
			target[year] = {};
		}
		if (!target[year][fund]) {
			target[year][fund] =
				{} as TotalBeneficiariesBySectorData[number][number];
		}

		const sectorsDatum: TotalBeneficiariesBySectorBreakdown = {
			sector: row.GlobalClusterId,
			girls: {
				targeted: row.BenG || 0,
				reached: row.AchG || 0,
			},
			boys: {
				targeted: row.BenB || 0,
				reached: row.AchB || 0,
			},
			women: {
				targeted: row.BenW || 0,
				reached: row.AchW || 0,
			},
			men: {
				targeted: row.BenM || 0,
				reached: row.AchM || 0,
			},
		};

		if (row.ProcessStatusId === null) {
			if (!target[year][fund].all) {
				target[year][fund].all = [sectorsDatum];
			} else {
				target[year][fund].all.push(sectorsDatum);
			}
		} else {
			//several raw statuses can map to the same status (e.g. Disbursement
			//and Implementation both map to Under Implementation): add their values
			const thisStatus = projectStatusMapping[row.ProcessStatusId];
			const foundDatum = target[year][fund][thisStatus]?.find(
				d => d.sector === sectorsDatum.sector,
			);
			if (foundDatum) {
				addTargetedAndReached(
					foundDatum,
					sectorsDatum,
					beneficiaryCategories,
				);
			} else {
				(target[year][fund][thisStatus] ??= []).push(sectorsDatum);
			}
		}
	});

	Object.values(target).forEach(yearData => {
		Object.values(yearData).forEach(fundData => {
			Object.entries(fundData).forEach(([status, statusData]) => {
				if (status === "all") return;
				statusData.forEach(datum => {
					const allDatum = fundData.all?.find(
						d => d.sector === datum.sector,
					);
					if (allDatum) {
						capTargetedAndReached(
							datum,
							allDatum,
							beneficiaryCategories,
						);
					}
				});
			});
		});
	});
}

function populateTotalBeneficiariesByBeneficiaryTypeData(
	source: TotalBeneficiariesByBeneficiaryTypeObject[],
	target: TotalBeneficiariesByBeneficiaryTypeData,
	sourceName: string,
	fundsPerBeneficiaryType: InDataLists["fundsPerBeneficiaryType"],
) {
	source.forEach(row => {
		const parsedRow =
			totalBeneficiariesByBeneficiaryTypeObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			warnInvalidSchema(sourceName, row, parsedRow.error.message);
			return;
		}
		const year = row.ImplementationYear;
		const fund = row.PFId;

		if (!target[year]) {
			target[year] = {};
		}
		if (!fundsPerBeneficiaryType[row.BeneficiaryTypeId]) {
			fundsPerBeneficiaryType[row.BeneficiaryTypeId] = new Set();
		}

		fundsPerBeneficiaryType[row.BeneficiaryTypeId].add(fund);

		if (!target[year][fund]) {
			target[year][fund] =
				{} as TotalBeneficiariesByBeneficiaryTypeData[number][number];
		}

		const beneficiaryTypeDatum: TotalBeneficiariesByBeneficiaryTypeBreakdown =
			{
				beneficiaryType: row.BeneficiaryTypeId,
				girls: {
					targeted: row.BenG || 0,
					reached: row.AchG || 0,
				},
				boys: {
					targeted: row.BenB || 0,
					reached: row.AchB || 0,
				},
				women: {
					targeted: row.BenW || 0,
					reached: row.AchW || 0,
				},
				men: {
					targeted: row.BenM || 0,
					reached: row.AchM || 0,
				},
			};

		if (row.ProcessStatusId === null) {
			if (!target[year][fund].all) {
				target[year][fund].all = [beneficiaryTypeDatum];
			} else {
				target[year][fund].all.push(beneficiaryTypeDatum);
			}
		} else {
			//several raw statuses can map to the same status (e.g. Disbursement
			//and Implementation both map to Under Implementation): add their values
			const thisStatus = projectStatusMapping[row.ProcessStatusId];
			const foundDatum = target[year][fund][thisStatus]?.find(
				d => d.beneficiaryType === beneficiaryTypeDatum.beneficiaryType,
			);
			if (foundDatum) {
				addTargetedAndReached(
					foundDatum,
					beneficiaryTypeDatum,
					beneficiaryCategories,
				);
			} else {
				(target[year][fund][thisStatus] ??= []).push(
					beneficiaryTypeDatum,
				);
			}
		}
	});

	Object.values(target).forEach(yearData => {
		Object.values(yearData).forEach(fundData => {
			Object.entries(fundData).forEach(([status, statusData]) => {
				if (status === "all") return;
				statusData.forEach(datum => {
					const allDatum = fundData.all?.find(
						d => d.beneficiaryType === datum.beneficiaryType,
					);
					if (allDatum) {
						capTargetedAndReached(
							datum,
							allDatum,
							beneficiaryCategories,
						);
					}
				});
			});
		});
	});
}

type TargetedAndReachedRecord<K extends string> = {
	[key in K]: TargetedAndReached;
};

function addTargetedAndReached<K extends string>(
	target: TargetedAndReachedRecord<K>,
	source: TargetedAndReachedRecord<K>,
	keys: readonly K[],
) {
	keys.forEach(key => {
		target[key].targeted += source[key].targeted;
		target[key].reached += source[key].reached;
	});
}

//the added statuses can overlap (same people in Disbursement and
//Implementation): a status can never be higher than the fund total
function capTargetedAndReached<K extends string>(
	target: TargetedAndReachedRecord<K>,
	cap: TargetedAndReachedRecord<K>,
	keys: readonly K[],
): void {
	keys.forEach(key => {
		target[key].targeted = Math.min(
			target[key].targeted,
			cap[key].targeted,
		);
		target[key].reached = Math.min(target[key].reached, cap[key].reached);
	});
}

export default processRawData;
