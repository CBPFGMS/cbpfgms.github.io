import {
	type ProjectSummaryObject,
	type SectorBeneficiaryObject,
	type TotalBeneficiariesObject,
	type TotalBeneficiariesByPartnerObject,
	type TotalBeneficiariesBySectorObject,
	type AllocationsByYearAndFundObject,
	projectSummaryObjectSchema,
	sectorBeneficiaryObjectSchema,
	totalBeneficiariesObjectSchema,
	totalBeneficiariesByPartnerObjectSchema,
	totalBeneficiariesBySectorObjectSchema,
	allocationsByYearAndFundObjectSchema,
} from "./schemas";
import type { List } from "./makelists";
import warnInvalidSchema, {
	simpleWarn,
	warnProjectNotFound,
} from "./warninvalid";
import { constants } from "./constants";

const { hasDisabledIds, hasGBVIds, hasGenderEqualityIds } = constants;

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

type LocalizationDatum = {
	fund: number;
	year: number;
	budget: number;
};

export type LocalizationData = LocalizationDatum[];

type SectorDatum = {
	sectorId: number;
	percentage: number;
	budget: number;
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
	sectorsPerYear: Map<number, Set<number>>;
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
	allocationsByYearAndFundWithUS: AllocationsByYearAndFundObject[];
	allocationsByYearAndFundWithoutUS: AllocationsByYearAndFundObject[];
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

function processRawData({
	projectSummary,
	sectorsData,
	lists,
	totalBeneficiaries,
	totalBeneficiariesByPartner,
	totalBeneficiariesBySector,
	allocationsByYearAndFundWithUS,
	allocationsByYearAndFundWithoutUS,
}: ProcessRawDataParams): {
	allocationsData: AllocationsData;
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	inAllocationsDataLists: InAllocationsDataLists;
	localizationDataWithUS: LocalizationData;
	localizationDataWithoutUS: LocalizationData;
} {
	const allocationsData: AllocationsData = [];
	const totalBeneficiariesData: TotalBeneficiariesData = {};
	const totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData = {};
	const totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData = {};
	const localizationDataWithUS: LocalizationData = [];
	const localizationDataWithoutUS: LocalizationData = [];

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
	const sectorsPerYearMap: (typeof inAllocationsDataLists)["sectorsPerYear"] =
		new Map();

	totalBeneficiaries.forEach(row => {
		const parsedRow = totalBeneficiariesObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			warnInvalidSchema(
				"totalBeneficiariesData",
				row,
				parsedRow.error.message,
			);
			return;
		}

		if (row.ProcessStatusId !== null) {
			return;
		}

		const totalDatum: TotalBeneficiariesBreakdown = {
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

		const foundYear = totalBeneficiariesData[row.ImplementationYear];

		if (!foundYear) {
			totalBeneficiariesData[row.ImplementationYear] = {
				[row.PFId]: totalDatum,
			};
		} else {
			foundYear[row.PFId] = totalDatum;
		}
	});

	totalBeneficiariesByPartner.forEach(row => {
		const parsedRow =
			totalBeneficiariesByPartnerObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			warnInvalidSchema(
				"totalBeneficiariesByPartner",
				row,
				parsedRow.error.message,
			);
			return;
		}

		if (row.ProcessStatusId !== null) {
			return;
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

		const foundYear =
			totalBeneficiariesByPartnerData[row.ImplementationYear];

		if (!foundYear) {
			totalBeneficiariesByPartnerData[row.ImplementationYear] = {
				[row.PFId]: [partnersDatum],
			};
		} else {
			const foundFund = foundYear[row.PFId];
			if (!foundFund) {
				foundYear[row.PFId] = [partnersDatum];
			} else {
				foundFund.push(partnersDatum);
			}
		}
	});

	totalBeneficiariesBySector.forEach(row => {
		const parsedRow = totalBeneficiariesBySectorObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			warnInvalidSchema(
				"totalBeneficiariesBySector",
				row,
				parsedRow.error.message,
			);
			return;
		}

		if (row.ProcessStatusId !== null) {
			return;
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

		const foundYear =
			totalBeneficiariesBySectorData[row.ImplementationYear];

		if (!foundYear) {
			totalBeneficiariesBySectorData[row.ImplementationYear] = {
				[row.PFId]: [sectorsDatum],
			};
		} else {
			const foundFund = foundYear[row.PFId];
			if (!foundFund) {
				foundYear[row.PFId] = [sectorsDatum];
			} else {
				foundFund.push(sectorsDatum);
			}
		}
	});

	populateLocalizationData(
		allocationsByYearAndFundWithUS,
		localizationDataWithUS,
		"allocationsByYearAndFundWithUS",
	);
	populateLocalizationData(
		allocationsByYearAndFundWithoutUS,
		localizationDataWithoutUS,
		"allocationsByYearAndFundWithoutUS",
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
							budget: row.CALCBudgetByCluster,
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
						budget: row.CALCBudgetByCluster,
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

				const thisYearSectors = sectorsPerYearMap.get(
					thisAllocationType.AllocationYear,
				);
				if (thisYearSectors) {
					thisSectorData.sectors.forEach(d => {
						thisYearSectors.add(d.sectorId);
					});
				} else {
					sectorsPerYearMap.set(
						thisAllocationType.AllocationYear,
						new Set(thisSectorData.sectors.map(d => d.sectorId)),
					);
				}

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
					hasWomenLedOrgs:
						thisOrganization.OrgIsWLO?.toLocaleLowerCase() ===
						"true",
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
		sectorsPerYear: sectorsPerYearMap,
	};

	return {
		allocationsData,
		totalBeneficiariesData,
		totalBeneficiariesByPartnerData,
		totalBeneficiariesBySectorData,
		inAllocationsDataLists,
		localizationDataWithUS,
		localizationDataWithoutUS,
	};

	function populateLocalizationData(
		source: AllocationsByYearAndFundObject[],
		target: LocalizationData,
		schemaName: string,
	): void {
		source.forEach(row => {
			const parsedRow =
				allocationsByYearAndFundObjectSchema.safeParse(row);
			if (parsedRow.success) {
				const thisYear = row.AllocationYear;
				const thisFundId = lists.fundIdsByName[row.PooledFundName];

				if (!thisFundId) {
					simpleWarn(
						`Fund with name ${row.PooledFundName} not found in the funds master`,
					);
					return;
				}

				if (
					!row.OrganizationType.includes("National") &&
					!row.OrganizationType.includes("Red") &&
					!row.OrganizationType.includes("Others")
				) {
					return;
				}

				const foundYearAndFund = target.find(
					e => e.fund === thisFundId && e.year === thisYear,
				);

				if (foundYearAndFund) {
					foundYearAndFund.budget += row.ApprovedBudget;
				} else {
					target.push({
						fund: thisFundId,
						year: thisYear,
						budget: row.ApprovedBudget,
					});
				}
			} else {
				warnInvalidSchema(schemaName, row, parsedRow.error.message);
			}
		});
	}
}

export default processRawData;
