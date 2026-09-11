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

const { hasDisabledIds, hasGBVIds, hasGenderEqualityIds, firstNSFTYear } =
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
	totalBeneficiariesUs: TotalBeneficiariesObject[];
	totalBeneficiariesByPartnerUs: TotalBeneficiariesByPartnerObject[];
	totalBeneficiariesBySectorUs: TotalBeneficiariesBySectorObject[];
	allocationsByYearAndFundWithUS: AllocationsByYearAndFundObject[];
	allocationsByYearAndFundWithoutUS: AllocationsByYearAndFundObject[];
};

type TargetedAndReached = {
	targeted: number;
	reached: number;
	targetedWithoutUS?: number;
	reachedWithoutUS?: number;
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
	totalBeneficiariesUs,
	totalBeneficiariesByPartnerUs,
	totalBeneficiariesBySectorUs,
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

		if (row.ImplementationYear >= firstNSFTYear) {
			totalDatum.girls.targetedWithoutUS = row.BenG || 0;
			totalDatum.girls.reachedWithoutUS = row.AchG || 0;
			totalDatum.boys.targetedWithoutUS = row.BenB || 0;
			totalDatum.boys.reachedWithoutUS = row.AchB || 0;
			totalDatum.women.targetedWithoutUS = row.BenW || 0;
			totalDatum.women.reachedWithoutUS = row.AchW || 0;
			totalDatum.men.targetedWithoutUS = row.BenM || 0;
			totalDatum.men.reachedWithoutUS = row.AchM || 0;
			totalDatum.total.targetedWithoutUS = row.TotTarg || 0;
			totalDatum.total.reachedWithoutUS = row.TotAch || 0;
		}

		const foundYear = totalBeneficiariesData[row.ImplementationYear];

		if (!foundYear) {
			totalBeneficiariesData[row.ImplementationYear] = {
				[row.PFId]: totalDatum,
			};
		} else {
			foundYear[row.PFId] = totalDatum;
		}
	});

	totalBeneficiariesUs.forEach(row => {
		const parsedRow = totalBeneficiariesObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			// warnInvalidSchema(
			// 	"totalBeneficiariesDataUS",
			// 	row,
			// 	parsedRow.error.message,
			// );
			//TODO: put the return back when the data has ImplementationYear
			//return;
		}

		let foundYear;
		if (row.ImplementationYear === null) {
			foundYear = totalBeneficiariesData[firstNSFTYear];
		} else {
			foundYear = totalBeneficiariesData[row.ImplementationYear];
		}

		if (!foundYear) {
			simpleWarn(
				`No data found for totalBeneficiariesUs ImplementationYear: ${
					row.ImplementationYear === null
						? firstNSFTYear
						: row.ImplementationYear
				}`,
			);
			return;
		}

		const foundFund = foundYear[row.PFId];
		if (!foundFund) {
			simpleWarn(
				`No data found for totalBeneficiariesUs PFId: ${row.PFId} in ImplementationYear: ${
					row.ImplementationYear === null
						? firstNSFTYear
						: row.ImplementationYear
				}`,
			);
			return;
		}

		foundFund.total.targetedWithoutUS =
			foundFund.total.targeted - (row.TotTarg || 0);
		foundFund.total.reachedWithoutUS =
			foundFund.total.reached - (row.TotAch || 0);
		foundFund.girls.targetedWithoutUS =
			foundFund.girls.targeted - (row.BenG || 0);
		foundFund.girls.reachedWithoutUS =
			foundFund.girls.reached - (row.AchG || 0);
		foundFund.boys.targetedWithoutUS =
			foundFund.boys.targeted - (row.BenB || 0);
		foundFund.boys.reachedWithoutUS =
			foundFund.boys.reached - (row.AchB || 0);
		foundFund.women.targetedWithoutUS =
			foundFund.women.targeted - (row.BenW || 0);
		foundFund.women.reachedWithoutUS =
			foundFund.women.reached - (row.AchW || 0);
		foundFund.men.targetedWithoutUS =
			foundFund.men.targeted - (row.BenM || 0);
		foundFund.men.reachedWithoutUS =
			foundFund.men.reached - (row.AchM || 0);
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

		if (row.ImplementationYear >= firstNSFTYear) {
			partnersDatum.girls.targetedWithoutUS = row.BenG || 0;
			partnersDatum.girls.reachedWithoutUS = row.AchG || 0;
			partnersDatum.boys.targetedWithoutUS = row.BenB || 0;
			partnersDatum.boys.reachedWithoutUS = row.AchB || 0;
			partnersDatum.women.targetedWithoutUS = row.BenW || 0;
			partnersDatum.women.reachedWithoutUS = row.AchW || 0;
			partnersDatum.men.targetedWithoutUS = row.BenM || 0;
			partnersDatum.men.reachedWithoutUS = row.AchM || 0;
		}

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

	totalBeneficiariesByPartnerUs.forEach(row => {
		const parsedRow =
			totalBeneficiariesByPartnerObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			// warnInvalidSchema(
			// 	"totalBeneficiariesByPartnerUs",
			// 	row,
			// 	parsedRow.error.message,
			// );
			//TODO: put the return back when the data has ImplementationYear
			//return;
		}

		let foundYear;
		if (row.ImplementationYear === null) {
			foundYear = totalBeneficiariesByPartnerData[firstNSFTYear];
		} else {
			foundYear = totalBeneficiariesByPartnerData[row.ImplementationYear];
		}

		if (!foundYear) {
			simpleWarn(
				`No data found for totalBeneficiariesByPartnersUs ImplementationYear: ${
					row.ImplementationYear === null
						? firstNSFTYear
						: row.ImplementationYear
				}`,
			);
			return;
		}

		const foundFund = foundYear[row.PFId];
		if (!foundFund) {
			simpleWarn(
				`No data found for totalBeneficiariesByPartnersUs PFId: ${row.PFId} in ImplementationYear: ${
					row.ImplementationYear === null
						? firstNSFTYear
						: row.ImplementationYear
				}`,
			);
			return;
		}

		const foundPartner = foundFund.find(
			partner => partner.partner === row.PartnerTypeId,
		);
		if (!foundPartner) {
			simpleWarn(
				`No data found for totalBeneficiariesByPartnersUs PartnerTypeId: ${row.PartnerTypeId} in PFId: ${row.PFId} and ImplementationYear: ${
					row.ImplementationYear === null
						? firstNSFTYear
						: row.ImplementationYear
				}`,
			);
			return;
		}

		foundPartner.girls.targetedWithoutUS =
			foundPartner.girls.targeted - (row.BenG || 0);
		foundPartner.girls.reachedWithoutUS =
			foundPartner.girls.reached - (row.AchG || 0);
		foundPartner.boys.targetedWithoutUS =
			foundPartner.boys.targeted - (row.BenB || 0);
		foundPartner.boys.reachedWithoutUS =
			foundPartner.boys.reached - (row.AchB || 0);
		foundPartner.women.targetedWithoutUS =
			foundPartner.women.targeted - (row.BenW || 0);
		foundPartner.women.reachedWithoutUS =
			foundPartner.women.reached - (row.AchW || 0);
		foundPartner.men.targetedWithoutUS =
			foundPartner.men.targeted - (row.BenM || 0);
		foundPartner.men.reachedWithoutUS =
			foundPartner.men.reached - (row.AchM || 0);
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

		if (row.ImplementationYear >= firstNSFTYear) {
			sectorsDatum.girls.targetedWithoutUS = row.BenG || 0;
			sectorsDatum.girls.reachedWithoutUS = row.AchG || 0;
			sectorsDatum.boys.targetedWithoutUS = row.BenB || 0;
			sectorsDatum.boys.reachedWithoutUS = row.AchB || 0;
			sectorsDatum.women.targetedWithoutUS = row.BenW || 0;
			sectorsDatum.women.reachedWithoutUS = row.AchW || 0;
			sectorsDatum.men.targetedWithoutUS = row.BenM || 0;
			sectorsDatum.men.reachedWithoutUS = row.AchM || 0;
		}

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

	totalBeneficiariesBySectorUs.forEach(row => {
		const parsedRow = totalBeneficiariesBySectorObjectSchema.safeParse(row);

		if (!parsedRow.success) {
			// warnInvalidSchema(
			// 	"totalBeneficiariesBySectorUs",
			// 	row,
			// 	parsedRow.error.message,
			// );
			//TODO: put the return back when the data has ImplementationYear
			//return;
		}

		let foundYear;
		if (row.ImplementationYear === null) {
			foundYear = totalBeneficiariesBySectorData[firstNSFTYear];
		} else {
			foundYear = totalBeneficiariesBySectorData[row.ImplementationYear];
		}

		if (!foundYear) {
			simpleWarn(
				`No data found for totalBeneficiariesBySectorUs ImplementationYear: ${
					row.ImplementationYear === null
						? firstNSFTYear
						: row.ImplementationYear
				}`,
			);
			return;
		}

		const foundFund = foundYear[row.PFId];
		if (!foundFund) {
			simpleWarn(
				`No data found for totalBeneficiariesBySectorUs PFId: ${row.PFId} in ImplementationYear: ${
					row.ImplementationYear === null
						? firstNSFTYear
						: row.ImplementationYear
				}`,
			);
			return;
		}

		const foundSector = foundFund.find(
			sector => sector.sector === row.GlobalClusterId,
		);
		if (!foundSector) {
			simpleWarn(
				`No data found for totalBeneficiariesBySectorUs Sector: ${row.GlobalClusterId} in PFId: ${row.PFId} and ImplementationYear: ${
					row.ImplementationYear === null
						? firstNSFTYear
						: row.ImplementationYear
				}`,
			);
			return;
		}

		foundSector.girls.targetedWithoutUS =
			foundSector.girls.targeted - (row.BenG || 0);
		foundSector.girls.reachedWithoutUS =
			foundSector.girls.reached - (row.AchG || 0);
		foundSector.boys.targetedWithoutUS =
			foundSector.boys.targeted - (row.BenB || 0);
		foundSector.boys.reachedWithoutUS =
			foundSector.boys.reached - (row.AchB || 0);
		foundSector.women.targetedWithoutUS =
			foundSector.women.targeted - (row.BenW || 0);
		foundSector.women.reachedWithoutUS =
			foundSector.women.reached - (row.AchW || 0);
		foundSector.men.targetedWithoutUS =
			foundSector.men.targeted - (row.BenM || 0);
		foundSector.men.reachedWithoutUS =
			foundSector.men.reached - (row.AchM || 0);
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
