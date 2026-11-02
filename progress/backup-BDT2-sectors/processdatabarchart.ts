import {
	InDataLists,
	TotalBeneficiariesByBeneficiaryTypeData,
	TotalBeneficiariesByPartnerData,
	TotalBeneficiariesBySectorData,
	TotalBeneficiariesByBeneficiaryTypeWithAllocTypeData,
	TotalBeneficiariesByPartnerWithAllocTypeData,
	TotalBeneficiariesBySectorWithAllocTypeData,
	FundWithAllocType,
} from "./processrawdata";
import { List } from "./makelists";
import { ImplementationStatuses } from "../components/MainContainer";
import { BeneficiariesObject, GenderAndAge } from "./processrawdata";
import constants from "./constants";
import { sum } from "d3";
import flipObject from "./flipobject";
import { sumStatusesCapped } from "./sumstatuses";

export type DatumBarChart = {
	type: number;
	targeted: BeneficiariesObject;
	reached: BeneficiariesObject;
};

type ProcessDataBarChartParams = {
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: FundWithAllocType[];
	implementationStatus: ImplementationStatuses[];
	lists: List;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	totalBeneficiariesByBeneficiaryTypeData: TotalBeneficiariesByBeneficiaryTypeData;
	totalBeneficiariesByPartnerWithAllocTypeData: TotalBeneficiariesByPartnerWithAllocTypeData;
	totalBeneficiariesBySectorWithAllocTypeData: TotalBeneficiariesBySectorWithAllocTypeData;
	totalBeneficiariesByBeneficiaryTypeWithAllocTypeData: TotalBeneficiariesByBeneficiaryTypeWithAllocTypeData;
	inDataLists: InDataLists;
	allStatusesSelected: boolean;
	allAllocationTypesSelected: boolean;
	allSourcesSelected: boolean;
};

type GenderBreakdown = {
	[key in GenderAndAge]: { targeted: number; reached: number };
};

const { beneficiaryCategories, isProdSite } = constants;

function processDataBarChart({
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	lists,
	totalBeneficiariesByPartnerData,
	totalBeneficiariesBySectorData,
	totalBeneficiariesByBeneficiaryTypeData,
	totalBeneficiariesByPartnerWithAllocTypeData,
	totalBeneficiariesBySectorWithAllocTypeData,
	totalBeneficiariesByBeneficiaryTypeWithAllocTypeData,
	inDataLists,
	allStatusesSelected,
	allSourcesSelected,
	allAllocationTypesSelected,
}: ProcessDataBarChartParams): {
	dataOrganization: DatumBarChart[];
	dataSector: DatumBarChart[];
	dataBeneficiaryByType: DatumBarChart[];
} {
	const dataBeneficiaryByType: DatumBarChart[] = [];
	const dataOrganization: DatumBarChart[] = [];
	const dataSector: DatumBarChart[] = [];
	const dataBeneficiaryByTypeForAllocType: DatumBarChart[] = [];
	const dataOrganizationForAllocType: DatumBarChart[] = [];
	const dataSectorForAllocType: DatumBarChart[] = [];

	const numericStatuses = flipObject(lists.statuses);

	const statuses = implementationStatus.map(
		implSt => +numericStatuses[implSt as ImplementationStatuses],
	);

	const beneficiaryTypes = Object.keys(lists.beneficiaryTypes).map(d => +d);

	const warnings: string[] = [];

	beneficiaryTypes.forEach(beneficiaryType => {
		const benObj = {
			type: beneficiaryType,
			targeted: beneficiaryCategories.reduce((acc, genderAndAge) => {
				acc[genderAndAge] = 0;
				return acc;
			}, {} as BeneficiariesObject),
			reached: beneficiaryCategories.reduce((acc, genderAndAge) => {
				acc[genderAndAge] = 0;
				return acc;
			}, {} as BeneficiariesObject),
		};
		dataBeneficiaryByType.push(benObj);
		dataBeneficiaryByTypeForAllocType.push(benObj);
	});

	//we always compute the "regular" arrays, because they will be used to cap the allocation types arrays.
	fund.forEach(pf => {
		year.forEach(selectedYear => {
			const thisFund = totalBeneficiariesByPartnerData[selectedYear][pf];

			if (!thisFund) {
				warnings.push(
					`Pooled fund code ${pf} not found in the totalBeneficiariesByPartner data for year ${selectedYear}`,
				);
				return;
			}

			const fundAndYearPartners = thisFund.all.map(d => d.partner);

			fundAndYearPartners.forEach(org => {
				let thisOrgData = dataOrganization.find(d => d.type === org);

				if (!thisOrgData) {
					thisOrgData = createEmptyDatumBarChart(org);
					dataOrganization.push(thisOrgData);
				}

				addFundFigures(
					thisOrgData,
					thisFund,
					d => d.partner === org,
					statuses,
					allStatusesSelected,
					`Partner ${org} not found in totalBeneficiariesByPartner data for fund ${pf}`,
				);
			});
		});
	});

	//if there is selection of allocation type or allocation source, we use the call with allocation types
	if (!allAllocationTypesSelected || !allSourcesSelected) {
		allocationType.forEach(allocType => {
			//Check if it has the allocation source
			const hasSource =
				allSourcesSelected ||
				lists.allocTypesPerSource[allocationSource[0]].has(allocType);

			const hasFund = fund.some(f => f === +allocType.split("-")[0]);

			if (!hasSource || !hasFund) {
				return;
			}

			year.forEach(selectedYear => {
				const thisAllocType =
					totalBeneficiariesByPartnerWithAllocTypeData[selectedYear][
						allocType
					];

				if (!thisAllocType) {
					warnings.push(
						`Allocation type code ${allocType} (pooled fund + "." +allocation type) not found in the totalBeneficiaries data for year ${selectedYear}`,
					);
					return;
				}

				const allocTypeAndYearPartners = thisAllocType.all.map(
					d => d.partner,
				);

				allocTypeAndYearPartners.forEach(org => {
					let thisOrgData = dataOrganizationForAllocType.find(
						d => d.type === org,
					);

					if (!thisOrgData) {
						thisOrgData = createEmptyDatumBarChart(org);
						dataOrganizationForAllocType.push(thisOrgData);
					}

					addFundFigures(
						thisOrgData,
						thisAllocType,
						d => d.partner === org,
						statuses,
						allStatusesSelected,
						`Partner ${org} not found in totalBeneficiariesByPartner data for allocation type code ${allocType} (pooled fund + "." +allocation type)`,
					);
				});
			});
		});
	}

	//we always compute the "regular" arrays, because they will be used to cap the allocation types arrays.
	fund.forEach(pf => {
		year.forEach(selectedYear => {
			const thisFund = totalBeneficiariesBySectorData[selectedYear][pf];

			if (!thisFund) {
				warnings.push(
					`Pooled fund code ${pf} not found in the totalBeneficiariesBySector data for year ${selectedYear}`,
				);
				return;
			}

			const fundAndYearSectors = thisFund.all.map(d => d.sector);

			fundAndYearSectors.forEach(sect => {
				let thisSectorData = dataSector.find(d => d.type === sect);

				if (!thisSectorData) {
					thisSectorData = createEmptyDatumBarChart(sect);
					dataSector.push(thisSectorData);
				}

				addFundFigures(
					thisSectorData,
					thisFund,
					d => d.sector === sect,
					statuses,
					allStatusesSelected,
					`Sector ${sect} not found in totalBeneficiariesBySector data for fund ${pf}`,
				);
			});
		});
	});

	//if there is selection of allocation type or allocation source, we use the call with allocation types
	if (!allAllocationTypesSelected || !allSourcesSelected) {
		allocationType.forEach(allocType => {
			const hasSource =
				allSourcesSelected ||
				lists.allocTypesPerSource[allocationSource[0]].has(allocType);

			const hasFund = fund.some(f => f === +allocType.split("-")[0]);

			if (!hasSource || !hasFund) {
				return;
			}

			year.forEach(selectedYear => {
				const thisAllocType =
					totalBeneficiariesBySectorWithAllocTypeData[selectedYear][
						allocType
					];

				if (!thisAllocType) {
					warnings.push(
						`Allocation type code ${allocType} (pooled fund + "." +allocation type) not found in the totalBeneficiariesBySector data for year ${selectedYear}`,
					);
					return;
				}

				const allocTypeAndYearSectors = thisAllocType.all.map(
					d => d.sector,
				);

				allocTypeAndYearSectors.forEach(sect => {
					let thisSectorData = dataSectorForAllocType.find(
						d => d.type === sect,
					);

					if (!thisSectorData) {
						thisSectorData = createEmptyDatumBarChart(sect);
						dataSectorForAllocType.push(thisSectorData);
					}

					addFundFigures(
						thisSectorData,
						thisAllocType,
						d => d.sector === sect,
						statuses,
						allStatusesSelected,
						`Sector ${sect} not found in totalBeneficiariesBySector data for allocation type code ${allocType} (pooled fund + "." +allocation type)`,
					);
				});
			});
		});
	}

	//we always compute the "regular" arrays, because they will be used to cap the allocation types arrays.
	dataBeneficiaryByType.forEach(benType => {
		fund.forEach(pf => {
			if (!inDataLists.fundsPerBeneficiaryType[benType.type]?.has(pf)) {
				return;
			}

			year.forEach(selectedYear => {
				const thisFund =
					totalBeneficiariesByBeneficiaryTypeData[selectedYear][pf];
				if (!thisFund) {
					warnings.push(
						`Pooled fund code ${pf} not found in the totalBeneficiariesByBeneficiaryType data for year ${selectedYear}`,
					);
					return;
				}

				addFundFigures(
					benType,
					thisFund,
					d => d.beneficiaryType === benType.type,
					statuses,
					allStatusesSelected,
					`Beneficiary type ${benType.type} not found in totalBeneficiariesByBeneficiaryType data for fund ${pf}`,
				);
			});
		});
	});

	dataBeneficiaryByTypeForAllocType.forEach(benType => {
		//if there is selection of allocation type or allocation source, we use the call with allocation types
		if (!allAllocationTypesSelected || !allSourcesSelected) {
			allocationType.forEach(allocType => {
				const hasSource =
					allSourcesSelected ||
					lists.allocTypesPerSource[allocationSource[0]].has(
						allocType,
					);

				const hasFund = fund.some(f => f === +allocType.split("-")[0]);

				if (!hasSource || !hasFund) {
					return;
				}

				year.forEach(selectedYear => {
					const thisAllocType =
						totalBeneficiariesByBeneficiaryTypeWithAllocTypeData[
							selectedYear
						][allocType];

					if (!thisAllocType) {
						warnings.push(
							`Allocation type code ${allocType} (pooled fund + "." +allocation type) not found in the totalBeneficiariesByBeneficiaryType data for year ${selectedYear}`,
						);
						return;
					}

					addFundFigures(
						benType,
						thisAllocType,
						d => d.beneficiaryType === benType.type,
						statuses,
						allStatusesSelected,
						`Beneficiary type ${benType.type} not found in totalBeneficiariesByBeneficiaryType data for allocation type code ${allocType} (pooled fund + "." +allocation type)`,
					);
				});
			});
		}
	});

	if (!isProdSite && warnings.length) {
		console.warn(warnings);
	}

	//if there is selection of allocation type or allocation source, we cap the results and return earlier
	if (!allAllocationTypesSelected || !allSourcesSelected) {
		dataOrganizationForAllocType.forEach(datumOrgAllocType => {
			const thisFundEquivalent = dataOrganization.find(
				datumOrg => datumOrg.type === datumOrgAllocType.type,
			);
			if (thisFundEquivalent) {
				beneficiaryCategories.forEach(genderAndAge => {
					datumOrgAllocType.targeted[genderAndAge] = Math.min(
						datumOrgAllocType.targeted[genderAndAge],
						thisFundEquivalent.targeted[genderAndAge],
					);
					datumOrgAllocType.reached[genderAndAge] = Math.min(
						datumOrgAllocType.reached[genderAndAge],
						thisFundEquivalent.reached[genderAndAge],
					);
				});
			}
		});

		dataSectorForAllocType.forEach(datumSectorAllocType => {
			const thisFundEquivalent = dataSector.find(
				datumSector => datumSector.type === datumSectorAllocType.type,
			);
			if (thisFundEquivalent) {
				beneficiaryCategories.forEach(genderAndAge => {
					datumSectorAllocType.targeted[genderAndAge] = Math.min(
						datumSectorAllocType.targeted[genderAndAge],
						thisFundEquivalent.targeted[genderAndAge],
					);
					datumSectorAllocType.reached[genderAndAge] = Math.min(
						datumSectorAllocType.reached[genderAndAge],
						thisFundEquivalent.reached[genderAndAge],
					);
				});
			}
		});

		dataBeneficiaryByTypeForAllocType.forEach(
			datumBeneficiaryByTypeAllocType => {
				const thisFundEquivalent = dataBeneficiaryByType.find(
					datumBeneficiaryByType =>
						datumBeneficiaryByType.type ===
						datumBeneficiaryByTypeAllocType.type,
				);
				if (thisFundEquivalent) {
					beneficiaryCategories.forEach(genderAndAge => {
						datumBeneficiaryByTypeAllocType.targeted[genderAndAge] =
							Math.min(
								datumBeneficiaryByTypeAllocType.targeted[
									genderAndAge
								],
								thisFundEquivalent.targeted[genderAndAge],
							);
						datumBeneficiaryByTypeAllocType.reached[genderAndAge] =
							Math.min(
								datumBeneficiaryByTypeAllocType.reached[
									genderAndAge
								],
								thisFundEquivalent.reached[genderAndAge],
							);
					});
				}
			},
		);

		dataBeneficiaryByTypeForAllocType.sort(
			(a, b) =>
				sum(Object.values(b.reached)) - sum(Object.values(a.reached)),
		);
		dataOrganizationForAllocType.sort(
			(a, b) =>
				sum(Object.values(b.reached)) - sum(Object.values(a.reached)),
		);
		dataSectorForAllocType.sort(
			(a, b) =>
				sum(Object.values(b.reached)) - sum(Object.values(a.reached)),
		);

		return {
			dataBeneficiaryByType: dataBeneficiaryByTypeForAllocType,
			dataOrganization: dataOrganizationForAllocType,
			dataSector: dataSectorForAllocType,
		};
	}

	dataBeneficiaryByType.sort(
		(a, b) => sum(Object.values(b.reached)) - sum(Object.values(a.reached)),
	);
	dataOrganization.sort(
		(a, b) => sum(Object.values(b.reached)) - sum(Object.values(a.reached)),
	);
	dataSector.sort(
		(a, b) => sum(Object.values(b.reached)) - sum(Object.values(a.reached)),
	);

	return { dataBeneficiaryByType, dataOrganization, dataSector };

	//adds one fund's figures for one partner/sector/beneficiary type: the unique
	//("all") figures when every status is selected, otherwise the sum of the
	//selected statuses limited to the unique figures
	function addFundFigures<T extends GenderBreakdown>(
		datum: DatumBarChart,
		thisFundData: { [status: number]: T[]; all: T[] },
		matches: (d: T) => boolean,
		statuses: number[],
		allStatusesSelected: boolean,
		warnMessage: string,
	): void {
		const allDatum = thisFundData.all.find(matches);

		let fundFigures: GenderBreakdown;

		if (allStatusesSelected) {
			if (!allDatum) {
				warnings.push(warnMessage);
				return;
			}
			fundFigures = allDatum;
		} else {
			const statusData = statuses.map(st => {
				const found = thisFundData[st]?.find(matches);
				if (!found) warnings.push(`${warnMessage} and status ${st}`);
				return found;
			});
			fundFigures = sumStatusesCapped(
				statusData,
				allDatum,
				beneficiaryCategories,
			);
		}

		beneficiaryCategories.forEach(key => {
			datum.targeted[key] += fundFigures[key].targeted;
			datum.reached[key] += fundFigures[key].reached;
		});
	}

	function createEmptyDatumBarChart(type: number): DatumBarChart {
		const targeted = beneficiaryCategories.reduce((acc, genderAndAge) => {
			acc[genderAndAge] = 0;
			return acc;
		}, {} as BeneficiariesObject);
		const reached = beneficiaryCategories.reduce((acc, genderAndAge) => {
			acc[genderAndAge] = 0;
			return acc;
		}, {} as BeneficiariesObject);

		const obj: DatumBarChart = {
			type,
			targeted,
			reached,
		};
		return obj;
	}
}

export default processDataBarChart;
