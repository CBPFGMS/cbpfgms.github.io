import {
	type ProjectSummaryObject,
	type SectorBeneficiaryObject,
	type TotalBeneficiariesObject,
	type TotalBeneficiariesByPartnerObject,
	type TotalBeneficiariesBySectorObject,
	projectSummaryObjectSchema,
	sectorBeneficiaryObjectSchema,
	totalBeneficiariesObjectSchema,
	totalBeneficiariesByPartnerObjectSchema,
	totalBeneficiariesBySectorObjectSchema,
} from "./schemas";
import type { List } from "./makelists";
import warnInvalidSchema, { warnProjectNotFound } from "./warninvalid";
import { constants } from "./constants";

const { partnersSplitOrder, hasDisabledIds, hasGBVIds, hasGenderEqualityIds } =
	constants;

export type AllocationsDatum = {
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
	sectorData: SectorDatum[];
	hasDisabled: boolean;
	hasGBV: boolean;
	hasGenderEquality: boolean;
	hasWomenLedOrgs: boolean;
};

export type AllocationsData = AllocationsDatum[];

type SectorDatum = {
	sectorId: number;
	percentage: number;
	reached: BeneficiariesObject;
	targeted: BeneficiariesObject;
};

type SectorMapValue = {
	projectCode: string;
	projectId: number;
	sectors: SectorDatum[];
};

export type GenderAndAge = (typeof constants.beneficiaryCategories)[number];

export type BeneficiariesObject = {
	[K in GenderAndAge]: number;
};

export type InAllocationsDataLists = {
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

type InAllocationsDataListsValues = SetType<InAllocationsDataLists>;

type ProcessRawDataParams = {
	projectSummary: ProjectSummaryObject[];
	sectorsData: SectorBeneficiaryObject[];
	listsObj: List;
	totalBeneficiaries: TotalBeneficiariesObject[];
	totalBeneficiariesByPartner: TotalBeneficiariesByPartnerObject[];
	totalBeneficiariesBySector: TotalBeneficiariesBySectorObject[];
};

type TargetedAndReached = {
	targeted: number;
	reached: number;
};

export type TotalBeneficiariesBreakdown = {
	[key in GenderAndAge | "total"]: TargetedAndReached;
};

export type TotalBeneficiariesData = {
	[key: number]: TotalBeneficiariesBreakdown;
};

type TotalBeneficiariesByPartnerBreakdown = {
	[key in GenderAndAge]: TargetedAndReached;
} & {
	partner: number;
};

export type TotalBeneficiariesByPartnerData = {
	[key: number]: TotalBeneficiariesByPartnerBreakdown[];
};

type TotalBeneficiariesBySectorBreakdown = {
	[key in GenderAndAge]: TargetedAndReached;
} & {
	sector: number;
};

export type TotalBeneficiariesBySectorData = {
	[key: number]: TotalBeneficiariesBySectorBreakdown[];
};

const partnersZeroArray: number[] = new Array(partnersSplitOrder.length).fill(
	0,
);

function processRawData({
	projectSummary,
	sectorsData,
	listsObj,
	totalBeneficiaries,
	totalBeneficiariesByPartner,
	totalBeneficiariesBySector,
}: ProcessRawDataParams): {
	allocationsData: AllocationsData;
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	inAllocationsDataLists: InAllocationsDataLists;
} {
	const allocationsData: AllocationsData = [];
	const totalBeneficiariesData: TotalBeneficiariesData = {};
	const totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData = {};
	const totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData = {};

	const sectorsDataMap: Map<string, SectorMapValue> = new Map();

	const yearsSet: Set<InAllocationsDataListsValues["years"]> = new Set();
	const sectorsSet: Set<InAllocationsDataListsValues["sectors"]> = new Set();
	const allocationTypesSet: Set<
		InAllocationsDataListsValues["allocationTypes"]
	> = new Set();
	const allocationSourcesSet: Set<
		InAllocationsDataListsValues["allocationSources"]
	> = new Set();
	const fundsSet: Set<InAllocationsDataListsValues["funds"]> = new Set();
	const organizationTypesSet: Set<
		InAllocationsDataListsValues["organizationTypes"]
	> = new Set();
	const organizationsSet: Set<InAllocationsDataListsValues["organizations"]> =
		new Set();

	const sectorsZeroArray: number[] = new Array(
		listsObj.sectorsSplitOrder.length,
	).fill(0);

	totalBeneficiaries.forEach(row => {
		const parsedRow = totalBeneficiariesObjectSchema.safeParse(row);
		if (parsedRow.success) {
			const projectKey = row.PFId;

			if (!totalBeneficiariesData[projectKey]) {
				totalBeneficiariesData[projectKey] =
					{} as TotalBeneficiariesData[number];
			}

			const totalDatum = {
				girls: {
					targeted: row.BenG,
					reached: row.AchG || 0,
				},
				boys: {
					targeted: row.BenB,
					reached: row.AchB || 0,
				},
				women: {
					targeted: row.BenW,
					reached: row.AchW || 0,
				},
				men: {
					targeted: row.BenM,
					reached: row.AchM || 0,
				},
				total: {
					targeted: row.TotTarg,
					reached: row.TotAch || 0,
				},
			};

			if (row.ProcessStatusId == null) {
				totalBeneficiariesData[projectKey] = totalDatum;
			}
		} else {
			warnInvalidSchema(
				"totalBeneficiariesData",
				row,
				parsedRow.error.message,
			);
		}
	});

	totalBeneficiariesByPartner.forEach(row => {
		const parsedRow =
			totalBeneficiariesByPartnerObjectSchema.safeParse(row);
		if (parsedRow.success) {
			const projectKey = row.PFId;
			const partnerValuesMen: number[] = row.BenM.split("#").map(Number);
			const partnerValuesWomen: number[] =
				row.BenW.split("#").map(Number);
			const partnerValuesBoys: number[] = row.BenB.split("#").map(Number);
			const partnerValuesGirls: number[] =
				row.BenG.split("#").map(Number);
			const partnerValuesAchGirls: number[] = row.AchG
				? row.AchG.split("#").map(Number)
				: partnersZeroArray;
			const partnerValuesAchBoys: number[] = row.AchB
				? row.AchB.split("#").map(Number)
				: partnersZeroArray;
			const partnerValuesAchWomen: number[] = row.AchW
				? row.AchW.split("#").map(Number)
				: partnersZeroArray;
			const partnerValuesAchMen: number[] = row.AchM
				? row.AchM.split("#").map(Number)
				: partnersZeroArray;

			const partnersDatum: TotalBeneficiariesByPartnerBreakdown[] =
				partnersSplitOrder.map((type, index) => {
					return {
						partner: type,
						girls: {
							targeted: partnerValuesGirls[index],
							reached: partnerValuesAchGirls[index],
						},
						boys: {
							targeted: partnerValuesBoys[index],
							reached: partnerValuesAchBoys[index],
						},
						women: {
							targeted: partnerValuesWomen[index],
							reached: partnerValuesAchWomen[index],
						},
						men: {
							targeted: partnerValuesMen[index],
							reached: partnerValuesAchMen[index],
						},
					};
				});

			if (!totalBeneficiariesByPartnerData[projectKey]) {
				totalBeneficiariesByPartnerData[projectKey] =
					{} as TotalBeneficiariesByPartnerData[number];
			}

			if (row.ProcessStatusId == null) {
				totalBeneficiariesByPartnerData[projectKey] = partnersDatum;
			}
		} else {
			warnInvalidSchema(
				"totalBeneficiariesByPartner",
				row,
				parsedRow.error.message,
			);
		}
	});

	totalBeneficiariesBySector.forEach(row => {
		const parsedRow = totalBeneficiariesBySectorObjectSchema.safeParse(row);
		if (parsedRow.success) {
			const projectKey = row.PFId;
			const sectorValuesMen: number[] = row.BenM.split("#").map(Number);
			const sectorValuesWomen: number[] = row.BenW.split("#").map(Number);
			const sectorValuesBoys: number[] = row.BenB.split("#").map(Number);
			const sectorValuesGirls: number[] = row.BenG.split("#").map(Number);
			const sectorValuesAchGirls: number[] = row.AchG
				? row.AchG.split("#").map(Number)
				: sectorsZeroArray;
			const sectorValuesAchBoys: number[] = row.AchB
				? row.AchB.split("#").map(Number)
				: sectorsZeroArray;
			const sectorValuesAchWomen: number[] = row.AchW
				? row.AchW.split("#").map(Number)
				: sectorsZeroArray;
			const sectorValuesAchMen: number[] = row.AchM
				? row.AchM.split("#").map(Number)
				: sectorsZeroArray;

			const sectorsDatum: TotalBeneficiariesBySectorBreakdown[] =
				listsObj.sectorsSplitOrder.map((type, index) => {
					return {
						sector: type,
						girls: {
							targeted: sectorValuesGirls[index],
							reached: sectorValuesAchGirls[index],
						},
						boys: {
							targeted: sectorValuesBoys[index],
							reached: sectorValuesAchBoys[index],
						},
						women: {
							targeted: sectorValuesWomen[index],
							reached: sectorValuesAchWomen[index],
						},
						men: {
							targeted: sectorValuesMen[index],
							reached: sectorValuesAchMen[index],
						},
					};
				});

			if (!totalBeneficiariesBySectorData[projectKey]) {
				totalBeneficiariesBySectorData[projectKey] =
					{} as TotalBeneficiariesBySectorData[number];
			}

			if (row.ProcessStatusId == null) {
				totalBeneficiariesBySectorData[projectKey] = sectorsDatum;
			}
		} else {
			warnInvalidSchema(
				"totalBeneficiariesBySector",
				row,
				parsedRow.error.message,
			);
		}
	});

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

	projectSummary.forEach(row => {
		const parsedRow = projectSummaryObjectSchema.safeParse(row);
		if (parsedRow.success) {
			const thisAllocationType =
				listsObj.allocationTypesCompleteList[
					parseFloat(`${row.PooledFundId}.${row.AllocationtypeId}`)
				];
			const thisOrganization =
				listsObj.organizationsCompleteList[row.GlobalOrgId];
			const thisSectorData = sectorsDataMap.get(row.ChfProjectCode);

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

			if (!thisSectorData) {
				warnProjectNotFound(
					row.ChfProjectCode,
					row,
					"Project not found in sectors data",
				);
			}

			if (thisAllocationType && thisOrganization && thisSectorData) {
				yearsSet.add(thisAllocationType.AllocationYear);
				fundsSet.add(row.PooledFundId);
				allocationSourcesSet.add(thisAllocationType.AllocationSourceId);
				organizationTypesSet.add(thisOrganization.OrganizationTypeId);
				organizationsSet.add(thisOrganization.GlobalOrgId);
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
					projectName: row.ChfProjectCode,
				});

				const objDatum: AllocationsDatum = {
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
					sectorData: thisSectorData.sectors,
					hasDisabled: (hasDisabledIds as readonly number[]).includes(
						row.DisabilityMarkerId,
					),
					hasGBV: (hasGBVIds as readonly number[]).includes(
						row.GBVMarkerId,
					),
					hasGenderEquality: (
						hasGenderEqualityIds as readonly number[]
					).includes(row.GenderEqualityMarkerId),
					hasWomenLedOrgs: true, //TODO: use real data
				};

				allocationsData.push(objDatum);
			}
		} else {
			warnInvalidSchema("projectSummary", row, parsedRow.error.message);
		}
	});

	const inAllocationsDataLists: InAllocationsDataLists = {
		years: yearsSet,
		sectors: sectorsSet,
		allocationTypes: allocationTypesSet,
		allocationSources: allocationSourcesSet,
		funds: fundsSet,
		organizationTypes: organizationTypesSet,
		organizations: organizationsSet,
	};

	return {
		allocationsData,
		totalBeneficiariesData,
		totalBeneficiariesByPartnerData,
		totalBeneficiariesBySectorData,
		inAllocationsDataLists,
	};
}

export default processRawData;
