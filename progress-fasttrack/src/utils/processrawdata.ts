import {
	ProjectSummaryObject,
	SectorBeneficiaryObject,
	TotalBeneficiariesObject,
	TotalBeneficiariesByPartnerObject,
	TotalBeneficiariesBySectorObject,
	TotalBeneficiariesByBeneficiaryTypeObject,
	CvaObject,
	TemplatesMasterJson,
	projectSummaryObjectSchema,
	sectorBeneficiaryObjectSchema,
	cvaObjectSchema,
	totalBeneficiariesObjectSchema,
	totalBeneficiariesByPartnerObjectSchema,
	totalBeneficiariesBySectorObjectSchema,
	totalBeneficiariesByBeneficiaryTypeObjectSchema,
	templatesMasterObjectSchema,
} from "./schemas";
import { List } from "./makelists";
import warnInvalidSchema, { warnProjectNotFound } from "./warninvalid";
import constants, { projectStatusMapping } from "./constants";
import type { Tranche } from "../components/MainContainer";

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
	budget: number;
	budgetGBVPlanned: number;
	budgetGBVReached: number;
	targetedGBV: number;
	reachedGBV: number;
	projectStatus: string;
	projectStatusId: number;
	sectorData: SectorDatum[];
	reportType: ReportType;
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
	statusesPerFund: { [key: number]: Set<number> };
	fundsPerTranche: { [key: number]: Set<number> };
	projectsPerTranche: { [key: number]: Set<string> };
};

type SetType<T> = {
	[P in keyof T]: T[P] extends Set<infer U> ? U : never;
};

type InDataListsValues = SetType<InDataLists>;

type ProcessRawDataParams = {
	projectSummary: ProjectSummaryObject[];
	sectorsData: SectorBeneficiaryObject[];
	cvaData: CvaObject[];
	listsObj: List;
	setInDataLists: React.Dispatch<React.SetStateAction<InDataLists>>;
	totalBeneficiaries: TotalBeneficiariesObject[];
	totalBeneficiariesTranche1: TotalBeneficiariesObject[];
	totalBeneficiariesTranche2: TotalBeneficiariesObject[];
	totalBeneficiariesByPartner: TotalBeneficiariesByPartnerObject[];
	totalBeneficiariesByPartnerTranche1: TotalBeneficiariesByPartnerObject[];
	totalBeneficiariesByPartnerTranche2: TotalBeneficiariesByPartnerObject[];
	totalBeneficiariesBySector: TotalBeneficiariesBySectorObject[];
	totalBeneficiariesBySectorTranche1: TotalBeneficiariesBySectorObject[];
	totalBeneficiariesBySectorTranche2: TotalBeneficiariesBySectorObject[];
	totalBeneficiariesByBeneficiaryType: TotalBeneficiariesByBeneficiaryTypeObject[];
	totalBeneficiariesByBeneficiaryTypeTranche1: TotalBeneficiariesByBeneficiaryTypeObject[];
	totalBeneficiariesByBeneficiaryTypeTranche2: TotalBeneficiariesByBeneficiaryTypeObject[];
	templatesMaster: TemplatesMasterJson;
};

type TargetedAndReached = {
	targeted: number;
	reached: number;
};

export type TotalBeneficiariesBreakdown = {
	[key in GenderAndAge | "total"]: TargetedAndReached;
};

export type TotalBeneficiariesData = {
	[fund: number]: {
		[status: number]: TotalBeneficiariesBreakdown;
		all: TotalBeneficiariesBreakdown;
	};
};

type TotalBeneficiariesByPartnerBreakdown = {
	[key in GenderAndAge]: TargetedAndReached;
} & {
	partner: number;
};

export type TotalBeneficiariesByPartnerData = {
	[fund: number]: {
		[status: number]: TotalBeneficiariesByPartnerBreakdown[];
		all: TotalBeneficiariesByPartnerBreakdown[];
	};
};

type TotalBeneficiariesBySectorBreakdown = {
	[key in GenderAndAge]: TargetedAndReached;
} & {
	sector: number;
};

export type TotalBeneficiariesBySectorData = {
	[fund: number]: {
		[status: number]: TotalBeneficiariesBySectorBreakdown[];
		all: TotalBeneficiariesBySectorBreakdown[];
	};
};

export type TotalBeneficiariesByBeneficiaryTypeBreakdown = {
	[key in GenderAndAge]: TargetedAndReached;
} & {
	beneficiaryType: number;
};

export type TotalBeneficiariesByBeneficiaryTypeData = {
	[fund: number]: {
		[status: number]: TotalBeneficiariesByBeneficiaryTypeBreakdown[];
		all: TotalBeneficiariesByBeneficiaryTypeBreakdown[];
	};
};

const { tranche1Name, tranche2Name } = constants;

function processRawData({
	projectSummary,
	sectorsData,
	cvaData,
	listsObj,
	setInDataLists,
	totalBeneficiaries,
	totalBeneficiariesTranche1,
	totalBeneficiariesTranche2,
	totalBeneficiariesByPartner,
	totalBeneficiariesByPartnerTranche1,
	totalBeneficiariesByPartnerTranche2,
	totalBeneficiariesBySector,
	totalBeneficiariesBySectorTranche1,
	totalBeneficiariesBySectorTranche2,
	totalBeneficiariesByBeneficiaryType,
	totalBeneficiariesByBeneficiaryTypeTranche1,
	totalBeneficiariesByBeneficiaryTypeTranche2,
	templatesMaster,
}: ProcessRawDataParams): {
	data: Data;
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesTranche1Data: TotalBeneficiariesData;
	totalBeneficiariesTranche2Data: TotalBeneficiariesData;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesByPartnerTranche1Data: TotalBeneficiariesByPartnerData;
	totalBeneficiariesByPartnerTranche2Data: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	totalBeneficiariesBySectorTranche1Data: TotalBeneficiariesBySectorData;
	totalBeneficiariesBySectorTranche2Data: TotalBeneficiariesBySectorData;
	totalBeneficiariesByBeneficiaryTypeData: TotalBeneficiariesByBeneficiaryTypeData;
	totalBeneficiariesByBeneficiaryTypeTranche1Data: TotalBeneficiariesByBeneficiaryTypeData;
	totalBeneficiariesByBeneficiaryTypeTranche2Data: TotalBeneficiariesByBeneficiaryTypeData;
} {
	const data: Data = [];
	const totalBeneficiariesData: TotalBeneficiariesData = {};
	const totalBeneficiariesTranche1Data: TotalBeneficiariesData = {};
	const totalBeneficiariesTranche2Data: TotalBeneficiariesData = {};
	const totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData = {};
	const totalBeneficiariesByPartnerTranche1Data: TotalBeneficiariesByPartnerData =
		{};
	const totalBeneficiariesByPartnerTranche2Data: TotalBeneficiariesByPartnerData =
		{};
	const totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData = {};
	const totalBeneficiariesBySectorTranche1Data: TotalBeneficiariesBySectorData =
		{};
	const totalBeneficiariesBySectorTranche2Data: TotalBeneficiariesBySectorData =
		{};
	const totalBeneficiariesByBeneficiaryTypeData: TotalBeneficiariesByBeneficiaryTypeData =
		{};
	const totalBeneficiariesByBeneficiaryTypeTranche1Data: TotalBeneficiariesByBeneficiaryTypeData =
		{};
	const totalBeneficiariesByBeneficiaryTypeTranche2Data: TotalBeneficiariesByBeneficiaryTypeData =
		{};

	const sectorsDataMap: Map<string, SectorMapValue> = new Map();
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
	const statusesPerFund: InDataLists["statusesPerFund"] = {};
	const fundsPerTranche: InDataLists["fundsPerTranche"] = {};
	const projectsPerTranche: InDataLists["projectsPerTranche"] = {};

	templatesMaster.data.forEach(row => {
		const parsedRow = templatesMasterObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			warnInvalidSchema("templatesMaster", row, parsedRow.error.message);
			return;
		}

		const thisTranche: Tranche = row.GroupNames.includes(tranche1Name)
			? 1
			: row.GroupNames.includes(tranche2Name)
				? 2
				: "all";

		if (thisTranche !== "all") {
			(fundsPerTranche[thisTranche] ??= new Set([row.PFId])).add(
				row.PFId,
			);

			if (projectsPerTranche[thisTranche] === undefined) {
				projectsPerTranche[thisTranche] = new Set(row.ProjectCodes);
			} else {
				row.ProjectCodes.forEach(projectCode => {
					projectsPerTranche[thisTranche].add(projectCode);
				});
			}
		}
	});

	populateTotalBeneficiariesData(
		totalBeneficiaries,
		totalBeneficiariesData,
		"totalBeneficiaries",
	);
	populateTotalBeneficiariesData(
		totalBeneficiariesTranche1,
		totalBeneficiariesTranche1Data,
		"totalBeneficiariesTranche1",
	);
	populateTotalBeneficiariesData(
		totalBeneficiariesTranche2,
		totalBeneficiariesTranche2Data,
		"totalBeneficiariesTranche2",
	);
	populateTotalBeneficiariesByPartnerData(
		totalBeneficiariesByPartner,
		totalBeneficiariesByPartnerData,
		"totalBeneficiariesByPartner",
	);
	populateTotalBeneficiariesByPartnerData(
		totalBeneficiariesByPartnerTranche1,
		totalBeneficiariesByPartnerTranche1Data,
		"totalBeneficiariesByPartnerTranche1",
	);
	populateTotalBeneficiariesByPartnerData(
		totalBeneficiariesByPartnerTranche2,
		totalBeneficiariesByPartnerTranche2Data,
		"totalBeneficiariesByPartnerTranche2",
	);
	populateTotalBeneficiariesBySectorData(
		totalBeneficiariesBySector,
		totalBeneficiariesBySectorData,
		"totalBeneficiariesBySector",
	);
	populateTotalBeneficiariesBySectorData(
		totalBeneficiariesBySectorTranche1,
		totalBeneficiariesBySectorTranche1Data,
		"totalBeneficiariesBySectorTranche1",
	);
	populateTotalBeneficiariesBySectorData(
		totalBeneficiariesBySectorTranche2,
		totalBeneficiariesBySectorTranche2Data,
		"totalBeneficiariesBySectorTranche2",
	);
	populateTotalBeneficiariesByBeneficiaryTypeData(
		totalBeneficiariesByBeneficiaryType,
		totalBeneficiariesByBeneficiaryTypeData,
		"totalBeneficiariesByBeneficiaryType",
	);
	populateTotalBeneficiariesByBeneficiaryTypeData(
		totalBeneficiariesByBeneficiaryTypeTranche1,
		totalBeneficiariesByBeneficiaryTypeTranche1Data,
		"totalBeneficiariesByBeneficiaryTypeTranche1",
	);
	populateTotalBeneficiariesByBeneficiaryTypeData(
		totalBeneficiariesByBeneficiaryTypeTranche2,
		totalBeneficiariesByBeneficiaryTypeTranche2Data,
		"totalBeneficiariesByBeneficiaryTypeTranche2",
	);

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
						"Project not found in sectorsDataMap",
					);
				}
			}
		} else {
			warnInvalidSchema("sectorsData", row, parsedRow.error.message);
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
			warnInvalidSchema("cvaData", row, parsedRow.error.message);
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
				listsObj.organizationsCompleteList[row.GlobalOrgId];
			const thisStatus =
				listsObj.statuses[projectStatusMapping[row.ProcessSTatusID]];
			const thisSectorData = sectorsDataMap.get(row.ChfProjectCode);
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
				organizationsSet.add(thisOrganization.GlobalOrgId);
				allocationTypesSet.add(
					parseFloat(`${row.PooledFundId}.${row.AllocationtypeId}`),
				);
				if (statusesPerFund[row.PooledFundId]) {
					statusesPerFund[row.PooledFundId].add(
						projectStatusMapping[row.ProcessSTatusID],
					);
				} else {
					statusesPerFund[row.PooledFundId] = new Set([
						projectStatusMapping[row.ProcessSTatusID],
					]);
				}

				listsObj.projectDetails.set(row.ChfId, {
					year: thisAllocationType.AllocationYear,
					fund: row.PooledFundId,
					allocationSource: thisAllocationType.AllocationSourceId,
					allocationType: parseFloat(
						`${row.PooledFundId}.${row.AllocationtypeId}`,
					),
					endDate: new Date(row.EndDate),
					projectStatusId: projectStatusMapping[row.ProcessSTatusID],
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
					organizationId: thisOrganization.GlobalOrgId,
					allocationType: parseFloat(
						`${row.PooledFundId}.${row.AllocationtypeId}`,
					),
					allocationTypeId: row.AllocationtypeId,
					endDate: new Date(row.EndDate),
					budget: row.Budget,
					projectStatus: thisStatus,
					projectStatusId: projectStatusMapping[row.ProcessSTatusID],
					sectorData: thisSectorData.sectors,
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
			warnInvalidSchema("projectSummary", row, parsedRow.error.message);
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
		statusesPerFund,
		fundsPerTranche,
		projectsPerTranche,
	}));

	return {
		data,
		totalBeneficiariesData,
		totalBeneficiariesTranche1Data,
		totalBeneficiariesTranche2Data,
		totalBeneficiariesByPartnerData,
		totalBeneficiariesByPartnerTranche1Data,
		totalBeneficiariesByPartnerTranche2Data,
		totalBeneficiariesBySectorData,
		totalBeneficiariesBySectorTranche1Data,
		totalBeneficiariesBySectorTranche2Data,
		totalBeneficiariesByBeneficiaryTypeData,
		totalBeneficiariesByBeneficiaryTypeTranche1Data,
		totalBeneficiariesByBeneficiaryTypeTranche2Data,
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
		const fund = row.PFId;

		if (!target[fund]) {
			target[fund] = {} as TotalBeneficiariesData[number];
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
			target[fund].all = totalDatum;
		} else {
			target[fund][projectStatusMapping[row.ProcessStatusId]] =
				totalDatum;
		}
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

		const fund = row.PFId;

		if (!target[fund]) {
			target[fund] = {} as TotalBeneficiariesByPartnerData[number];
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
			if (!target[fund].all) {
				target[fund].all = [partnersDatum];
			} else {
				target[fund].all.push(partnersDatum);
			}
		} else {
			const thisStatus = projectStatusMapping[row.ProcessStatusId];
			if (!target[fund][thisStatus]) {
				target[fund][thisStatus] = [partnersDatum];
			} else {
				target[fund][thisStatus].push(partnersDatum);
			}
		}
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

		const fund = row.PFId;

		if (!target[fund]) {
			target[fund] = {} as TotalBeneficiariesBySectorData[number];
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
			if (!target[fund].all) {
				target[fund].all = [sectorsDatum];
			} else {
				target[fund].all.push(sectorsDatum);
			}
		} else {
			const thisStatus = projectStatusMapping[row.ProcessStatusId];
			if (!target[fund][thisStatus]) {
				target[fund][thisStatus] = [sectorsDatum];
			} else {
				target[fund][thisStatus].push(sectorsDatum);
			}
		}
	});
}

function populateTotalBeneficiariesByBeneficiaryTypeData(
	source: TotalBeneficiariesByBeneficiaryTypeObject[],
	target: TotalBeneficiariesByBeneficiaryTypeData,
	sourceName: string,
) {
	source.forEach(row => {
		const parsedRow =
			totalBeneficiariesByBeneficiaryTypeObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			warnInvalidSchema(sourceName, row, parsedRow.error.message);
			return;
		}

		const fund = row.PFId;

		if (!target[fund]) {
			target[fund] =
				{} as TotalBeneficiariesByBeneficiaryTypeData[number];
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
			if (!target[fund].all) {
				target[fund].all = [beneficiaryTypeDatum];
			} else {
				target[fund].all.push(beneficiaryTypeDatum);
			}
		} else {
			const thisStatus = projectStatusMapping[row.ProcessStatusId];
			if (!target[fund][thisStatus]) {
				target[fund][thisStatus] = [beneficiaryTypeDatum];
			} else {
				target[fund][thisStatus].push(beneficiaryTypeDatum);
			}
		}
	});
}

export default processRawData;
