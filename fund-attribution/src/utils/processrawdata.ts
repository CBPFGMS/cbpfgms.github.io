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
import { constants, projectStatusMappingProjSumV4 } from "./constants";
import { makeAllocTypeId } from "./makealloctypeid";

const {
	hasDisabledIds,
	hasGBVIds,
	hasGenderEqualityIds,
	implementationAndReportingProjects,
} = constants;

export type AllocationsDatum = {
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
	totalBeneficiariesWithoutUs: TotalBeneficiariesObject[];
	totalBeneficiariesByPartnerWithoutUs: TotalBeneficiariesByPartnerObject[];
	totalBeneficiariesBySectorWithoutUs: TotalBeneficiariesBySectorObject[];
	allocationsByYearAndFundWithUS: AllocationsByYearAndFundObject[];
	allocationsByYearAndFundWithoutUS: AllocationsByYearAndFundObject[];
	selectedFund: number;
	effectiveStartYear: number;
};

type TargetedAndReached = {
	targeted: number;
	reached: number;
	targetedWithoutUS: number;
	reachedWithoutUS: number;
};

export type TotalBeneficiariesBreakdown = {
	[key in GenderAndAge | "total"]: TargetedAndReached;
};

export type TotalBeneficiariesData = {
	[year: number]: TotalBeneficiariesBreakdown;
};

type TotalBeneficiariesByPartnerBreakdown = {
	[key in GenderAndAge]: TargetedAndReached;
} & {
	partner: number;
};

export type TotalBeneficiariesByPartnerData = {
	[year: number]: TotalBeneficiariesByPartnerBreakdown[];
};

type TotalBeneficiariesBySectorBreakdown = {
	[key in GenderAndAge]: TargetedAndReached;
} & {
	sector: number;
};

export type TotalBeneficiariesBySectorData = {
	[year: number]: TotalBeneficiariesBySectorBreakdown[];
};

function processRawData({
	projectSummary,
	sectorsData,
	lists,
	totalBeneficiaries,
	totalBeneficiariesByPartner,
	totalBeneficiariesBySector,
	totalBeneficiariesWithoutUs,
	totalBeneficiariesByPartnerWithoutUs,
	totalBeneficiariesBySectorWithoutUs,
	allocationsByYearAndFundWithUS,
	allocationsByYearAndFundWithoutUS,
	selectedFund,
	effectiveStartYear,
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

		//keep just the fund of the attribution page. Also, remove year data before the selected start year
		if (
			row.PFId !== selectedFund ||
			row.ImplementationYear < effectiveStartYear
		) {
			return;
		}

		const totalDatum: TotalBeneficiariesBreakdown = {
			girls: {
				targeted: row.BenG || 0,
				reached: row.AchG || 0,
				targetedWithoutUS: 0,
				reachedWithoutUS: 0,
			},
			boys: {
				targeted: row.BenB || 0,
				reached: row.AchB || 0,
				targetedWithoutUS: 0,
				reachedWithoutUS: 0,
			},
			women: {
				targeted: row.BenW || 0,
				reached: row.AchW || 0,
				targetedWithoutUS: 0,
				reachedWithoutUS: 0,
			},
			men: {
				targeted: row.BenM || 0,
				reached: row.AchM || 0,
				targetedWithoutUS: 0,
				reachedWithoutUS: 0,
			},
			total: {
				targeted: row.TotTarg || 0,
				reached: row.TotAch || 0,
				targetedWithoutUS: 0,
				reachedWithoutUS: 0,
			},
		};

		totalBeneficiariesData[row.ImplementationYear] = totalDatum;
	});

	totalBeneficiariesWithoutUs.forEach(row => {
		const parsedRow = totalBeneficiariesObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			warnInvalidSchema(
				"totalBeneficiariesDataUS",
				row,
				parsedRow.error.message,
			);
			return;
		}

		//keep just the fund of the attribution page. Also, remove year data before the selected start year
		if (
			row.PFId !== selectedFund ||
			row.ImplementationYear < effectiveStartYear
		) {
			return;
		}

		const foundYear = totalBeneficiariesData[row.ImplementationYear];

		if (!foundYear) {
			simpleWarn(
				`No data found for totalBeneficiariesUs ImplementationYear: ${row.ImplementationYear}`,
			);
			return;
		}

		foundYear.total.targetedWithoutUS = row.TotTarg || 0;
		foundYear.total.reachedWithoutUS = row.TotAch || 0;
		foundYear.girls.targetedWithoutUS = row.BenG || 0;
		foundYear.girls.reachedWithoutUS = row.AchG || 0;
		foundYear.boys.targetedWithoutUS = row.BenB || 0;
		foundYear.boys.reachedWithoutUS = row.AchB || 0;
		foundYear.women.targetedWithoutUS = row.BenW || 0;
		foundYear.women.reachedWithoutUS = row.AchW || 0;
		foundYear.men.targetedWithoutUS = row.BenM || 0;
		foundYear.men.reachedWithoutUS = row.AchM || 0;
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

		//keep just the fund of the attribution page. Also, remove year data before the selected start year
		if (
			row.PFId !== selectedFund ||
			row.ImplementationYear < effectiveStartYear
		) {
			return;
		}

		const partnersDatum: TotalBeneficiariesByPartnerBreakdown = {
			partner: row.PartnerTypeId,
			girls: {
				targeted: row.BenG || 0,
				reached: row.AchG || 0,
				targetedWithoutUS: 0,
				reachedWithoutUS: 0,
			},
			boys: {
				targeted: row.BenB || 0,
				reached: row.AchB || 0,
				targetedWithoutUS: 0,
				reachedWithoutUS: 0,
			},
			women: {
				targeted: row.BenW || 0,
				reached: row.AchW || 0,
				targetedWithoutUS: 0,
				reachedWithoutUS: 0,
			},
			men: {
				targeted: row.BenM || 0,
				reached: row.AchM || 0,
				targetedWithoutUS: 0,
				reachedWithoutUS: 0,
			},
		};

		const foundYear =
			totalBeneficiariesByPartnerData[row.ImplementationYear];

		if (!foundYear) {
			totalBeneficiariesByPartnerData[row.ImplementationYear] = [
				partnersDatum,
			];
		} else {
			foundYear.push(partnersDatum);
		}
	});

	totalBeneficiariesByPartnerWithoutUs.forEach(row => {
		const parsedRow =
			totalBeneficiariesByPartnerObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			warnInvalidSchema(
				"totalBeneficiariesByPartnerUs",
				row,
				parsedRow.error.message,
			);
			return;
		}

		//keep just the fund of the attribution page. Also, remove year data before the selected start year
		if (
			row.PFId !== selectedFund ||
			row.ImplementationYear < effectiveStartYear
		) {
			return;
		}

		const foundYear =
			totalBeneficiariesByPartnerData[row.ImplementationYear];

		if (!foundYear) {
			simpleWarn(
				`No data found for totalBeneficiariesByPartnersUs ImplementationYear: ${row.ImplementationYear}`,
			);
			return;
		}

		const foundPartner = foundYear.find(
			partner => partner.partner === row.PartnerTypeId,
		);

		if (!foundPartner) {
			simpleWarn(
				`No data found for totalBeneficiariesByPartnersUs PartnerTypeId: ${row.PartnerTypeId} in PFId: ${row.PFId} and ImplementationYear: ${
					row.ImplementationYear
				}`,
			);
			return;
		}

		foundPartner.girls.targetedWithoutUS = row.BenG || 0;
		foundPartner.girls.reachedWithoutUS = row.AchG || 0;
		foundPartner.boys.targetedWithoutUS = row.BenB || 0;
		foundPartner.boys.reachedWithoutUS = row.AchB || 0;
		foundPartner.women.targetedWithoutUS = row.BenW || 0;
		foundPartner.women.reachedWithoutUS = row.AchW || 0;
		foundPartner.men.targetedWithoutUS = row.BenM || 0;
		foundPartner.men.reachedWithoutUS = row.AchM || 0;
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

		//keep just the fund of the attribution page. Also, remove year data before the selected start year
		if (
			row.PFId !== selectedFund ||
			row.ImplementationYear < effectiveStartYear
		) {
			return;
		}

		const sectorsDatum: TotalBeneficiariesBySectorBreakdown = {
			sector: row.GlobalClusterId,
			girls: {
				targeted: row.BenG || 0,
				reached: row.AchG || 0,
				targetedWithoutUS: 0,
				reachedWithoutUS: 0,
			},
			boys: {
				targeted: row.BenB || 0,
				reached: row.AchB || 0,
				targetedWithoutUS: 0,
				reachedWithoutUS: 0,
			},
			women: {
				targeted: row.BenW || 0,
				reached: row.AchW || 0,
				targetedWithoutUS: 0,
				reachedWithoutUS: 0,
			},
			men: {
				targeted: row.BenM || 0,
				reached: row.AchM || 0,
				targetedWithoutUS: 0,
				reachedWithoutUS: 0,
			},
		};

		const foundYear =
			totalBeneficiariesBySectorData[row.ImplementationYear];

		if (!foundYear) {
			totalBeneficiariesBySectorData[row.ImplementationYear] = [
				sectorsDatum,
			];
		} else {
			foundYear.push(sectorsDatum);
		}
	});

	totalBeneficiariesBySectorWithoutUs.forEach(row => {
		const parsedRow = totalBeneficiariesBySectorObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			warnInvalidSchema(
				"totalBeneficiariesBySectorUs",
				row,
				parsedRow.error.message,
			);
			return;
		}

		//keep just the fund of the attribution page. Also, remove year data before the selected start year
		if (
			row.PFId !== selectedFund ||
			row.ImplementationYear < effectiveStartYear
		) {
			return;
		}

		const foundYear =
			totalBeneficiariesBySectorData[row.ImplementationYear];

		if (!foundYear) {
			simpleWarn(
				`No data found for totalBeneficiariesBySectorUs ImplementationYear: ${
					row.ImplementationYear
				}`,
			);
			return;
		}

		const foundSector = foundYear.find(
			sector => sector.sector === row.GlobalClusterId,
		);

		if (!foundSector) {
			simpleWarn(
				`No data found for totalBeneficiariesBySectorUs Sector: ${row.GlobalClusterId} in PFId: ${row.PFId} and ImplementationYear: ${
					row.ImplementationYear
				}`,
			);
			return;
		}

		foundSector.girls.targetedWithoutUS = row.BenG || 0;
		foundSector.girls.reachedWithoutUS = row.AchG || 0;
		foundSector.boys.targetedWithoutUS = row.BenB || 0;
		foundSector.boys.reachedWithoutUS = row.AchB || 0;
		foundSector.women.targetedWithoutUS = row.BenW || 0;
		foundSector.women.reachedWithoutUS = row.AchW || 0;
		foundSector.men.targetedWithoutUS = row.BenM || 0;
		foundSector.men.reachedWithoutUS = row.AchM || 0;
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
			//keep just the fund of the attribution page.
			if (row.PooledFundId !== selectedFund) {
				return;
			}

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
					const foundSector = projectData.sectors.find(
						sector => sector.sectorId === row.GlobalClusterId,
					);
					if (!foundSector) {
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
						foundSector.percentage += row.Percentage / 100;
						foundSector.reached.girls += row.ActualGirls || 0;
						foundSector.reached.boys += row.ActualBoys || 0;
						foundSector.reached.women += row.ActualWomen || 0;
						foundSector.reached.men += row.ActualMen || 0;
						foundSector.targeted.girls += row.TargetGirls || 0;
						foundSector.targeted.boys += row.TargetBoys || 0;
						foundSector.targeted.women += row.TargetWomen || 0;
						foundSector.targeted.men += row.TargetMen || 0;
						foundSector.budget += row.CALCBudgetByCluster;
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
			warnInvalidSchema("sectorsData", row, parsedRow.error.message);
		}
	});

	projectSummary.forEach(row => {
		const parsedRow = projectSummaryObjectSchema.safeParse(row);
		if (parsedRow.success) {
			//This data comes from Project Summary V4, which contains statuses not used by the other datasets
			//("Submission of Proposal", "Under Review" and "Under Final Approval"), so we filter out
			// any row that have status 1, 2 or 3 (after mapping) by returning earlier
			const thisStatusId =
				projectStatusMappingProjSumV4[row.ProcessSTatusID];
			if (
				!(
					implementationAndReportingProjects as readonly number[]
				).includes(thisStatusId)
			) {
				return;
			}

			const thisAllocTypeId = makeAllocTypeId(
				row.PooledFundId,
				row.AllocationtypeId,
			);

			const thisAllocationType =
				lists.allocationTypesCompleteList[thisAllocTypeId];

			//keep just the fund of the attribution page. Also, remove year data before the selected start year
			if (
				row.PooledFundId !== selectedFund ||
				thisAllocationType.AllocationYear < effectiveStartYear
			) {
				return;
			}

			const thisOrganization =
				lists.organizationsCompleteList[row.GlobalOrgId];
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
				allocationSourcesSet.add(thisAllocationType.AllocationSourceId);
				organizationTypesSet.add(thisOrganization.OrganizationTypeId);
				organizationsSet.add(thisOrganization.GlobalOrgId);
				allocationTypesSet.add(thisAllocTypeId);

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
					allocationType: thisAllocTypeId,
					endDate: new Date(row.EndDate),
					projectName: row.ChfProjectCode,
				});

				const objDatum: AllocationsDatum = {
					year: thisAllocationType.AllocationYear,
					projectCode: row.ChfProjectCode,
					projectId: row.ChfId,
					allocationSource: thisAllocationType.AllocationSourceId,
					organizationType: thisOrganization.OrganizationTypeId,
					organizationId: thisOrganization.GlobalOrgId,
					allocationType: thisAllocTypeId,
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
				const thisFundId = lists.fundIdsByName[row.PooledFundName];

				if (!thisFundId) {
					simpleWarn(
						`Fund with name ${row.PooledFundName} not found in the funds master`,
					);
					return;
				}

				const thisYear = row.AllocationYear;

				//keep just the fund of the attribution page. Also, remove year data before the selected start year
				if (
					thisFundId !== selectedFund ||
					thisYear < effectiveStartYear
				) {
					return;
				}

				if (
					!row.OrganizationType.includes("National") &&
					!row.OrganizationType.includes("Red") &&
					!row.OrganizationType.includes("Others")
				) {
					return;
				}

				const foundYear = target.find(e => e.year === thisYear);

				if (foundYear) {
					foundYear.budget += row.ApprovedBudget;
				} else {
					target.push({
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
