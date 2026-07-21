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

const {
	partnersSplitOrder,
	hasDisabledIds,
	hasGBVIds,
	hasGenderEqualityIds,
	localizationMarkers,
} = constants;

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
	isLocalised: boolean;
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
	lists: List;
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
	[year: number]: { [fundId: number]: TotalBeneficiariesBreakdown };
};

type TotalBeneficiariesByPartnerBreakdown = {
	[key in GenderAndAge]: TargetedAndReached;
} & {
	partner: number;
};

export type TotalBeneficiariesByPartnerData = {
	[year: number]: {
		[fundId: number]: TotalBeneficiariesByPartnerBreakdown[];
	};
};

type TotalBeneficiariesBySectorBreakdown = {
	[key in GenderAndAge]: TargetedAndReached;
} & {
	sector: number;
};

export type TotalBeneficiariesBySectorData = {
	[year: number]: { [fundId: number]: TotalBeneficiariesBySectorBreakdown[] };
};

const partnersZeroArray: number[] = new Array(partnersSplitOrder.length).fill(
	0,
);

function processRawData({
	projectSummary,
	sectorsData,
	lists,
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
		lists.sectorsSplitOrder.length,
	).fill(0);

	totalBeneficiaries.forEach(row => {
		const parsedRow = totalBeneficiariesObjectSchema.safeParse(row);
		if (parsedRow.success) {
			if (row.ProcessStatusId === null) {
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

				const foundYear = totalBeneficiariesData[row.AllocationYear];

				if (!foundYear) {
					totalBeneficiariesData[row.AllocationYear] = {
						[row.PFId]: totalDatum,
					};
				} else {
					foundYear[row.PFId] = totalDatum;
				}
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
			if (row.ProcessStatusId === null) {
				const partnerValuesMen: number[] =
					row.BenM.split("#").map(Number);
				const partnerValuesWomen: number[] =
					row.BenW.split("#").map(Number);
				const partnerValuesBoys: number[] =
					row.BenB.split("#").map(Number);
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

				const foundYear =
					totalBeneficiariesByPartnerData[row.AllocationYear];

				if (!foundYear) {
					totalBeneficiariesByPartnerData[row.AllocationYear] = {
						[row.PFId]: partnersDatum,
					};
				} else {
					foundYear[row.PFId] = partnersDatum;
				}
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
			if (row.ProcessStatusId === null) {
				const sectorValuesMen: number[] =
					row.BenM.split("#").map(Number);
				const sectorValuesWomen: number[] =
					row.BenW.split("#").map(Number);
				const sectorValuesBoys: number[] =
					row.BenB.split("#").map(Number);
				const sectorValuesGirls: number[] =
					row.BenG.split("#").map(Number);
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
					lists.sectorsSplitOrder.map((type, index) => {
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

				const foundYear =
					totalBeneficiariesBySectorData[row.AllocationYear];

				if (!foundYear) {
					totalBeneficiariesBySectorData[row.AllocationYear] = {
						[row.PFId]: sectorsDatum,
					};
				} else {
					foundYear[row.PFId] = sectorsDatum;
				}
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
							percentage: row.Percentage / 100,
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
						percentage: row.Percentage / 100,
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
				lists.allocationTypesCompleteList[
					parseFloat(`${row.PooledFundId}.${row.AllocationtypeId}`)
				];
			const thisOrganization =
				lists.organizationsCompleteList[row.GlobalUniqueOrgId];
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
				organizationsSet.add(thisOrganization.GlobalUniqueId);
				allocationTypesSet.add(
					parseFloat(`${row.PooledFundId}.${row.AllocationtypeId}`),
				);

				lists.projectDetails.set(row.ChfId, {
					year: thisAllocationType.AllocationYear,
					fund: row.PooledFundId,
					allocationSource: thisAllocationType.AllocationSourceId,
					allocationType: parseFloat(
						`${row.PooledFundId}.${row.AllocationtypeId}`,
					),
					endDate: new Date(row.EndDate),
					projectName: row.ChfProjectCode,
				});

				const thisLocalisationMarker =
					thisOrganization.LocalizationMarker?.split(" ")[0];

				const objDatum: AllocationsDatum = {
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
					budget: row.Budget,
					sectorData: thisSectorData.sectors,
					hasDisabled:
						row.DisabilityMarkerId !== null &&
						(hasDisabledIds as readonly number[]).includes(
							row.DisabilityMarkerId,
						),
					hasGBV:
						row.GBVMarkerId !== null &&
						(hasGBVIds as readonly number[]).includes(
							row.GBVMarkerId,
						),
					hasGenderEquality:
						row.GenderEqualityMarkerId !== null &&
						(hasGenderEqualityIds as readonly number[]).includes(
							row.GenderEqualityMarkerId,
						),
					hasWomenLedOrgs: thisOrganization.OrgIsWLO?.toLocaleLowerCase() === "true",
					isLocalised:
						thisLocalisationMarker !== undefined &&
						(localizationMarkers as readonly string[]).includes(
							thisLocalisationMarker,
						),
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
