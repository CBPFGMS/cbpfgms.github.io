import {
	Data,
	InDataLists,
	TotalBeneficiariesByBeneficiaryTypeData,
	TotalBeneficiariesByPartnerData,
	TotalBeneficiariesBySectorData,
	TotalBeneficiariesByBeneficiaryTypeWithAllocTypeData,
	TotalBeneficiariesByPartnerWithAllocTypeData,
	TotalBeneficiariesBySectorWithAllocTypeData,
} from "./processrawdata";
import { List } from "./makelists";
import { ImplementationStatuses } from "../components/MainContainer";
import { BeneficiariesObject, GenderAndAge } from "./processrawdata";
import constants from "./constants";
import { sum } from "d3";
import { simpleWarn } from "./warninvalid";
import flipObject from "./flipobject";
import { sumStatusesCapped } from "./sumstatuses";

export type DatumBarChart = {
	type: number;
	fundsWithType: Set<number>;
	alloctypesWithType: Set<number>;
	targeted: BeneficiariesObject;
	reached: BeneficiariesObject;
};

type ProcessDataBarChartParams = {
	data: Data;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
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

const { beneficiaryCategories } = constants;

function processDataBarChart({
	data,
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

	const numericStatuses = flipObject(lists.statuses);

	const statuses = implementationStatus.map(
		implSt => +numericStatuses[implSt as ImplementationStatuses],
	);

	const beneficiaryTypes = Object.keys(lists.beneficiaryTypes).map(d => +d);

	beneficiaryTypes.forEach(beneficiaryType => {
		dataBeneficiaryByType.push({
			type: beneficiaryType,
			fundsWithType: new Set(),
			alloctypesWithType: new Set(),
			targeted: beneficiaryCategories.reduce((acc, genderAndAge) => {
				acc[genderAndAge] = 0;
				return acc;
			}, {} as BeneficiariesObject),
			reached: beneficiaryCategories.reduce((acc, genderAndAge) => {
				acc[genderAndAge] = 0;
				return acc;
			}, {} as BeneficiariesObject),
		});
	});

	data.forEach(datum => {
		const thisStatus = lists.statuses[
			datum.projectStatusId
		] as ImplementationStatuses;
		if (
			implementationStatus.includes(thisStatus) &&
			year.includes(datum.year) &&
			fund.includes(datum.fund) &&
			allocationSource.includes(datum.allocationSource) &&
			allocationType.includes(datum.allocationType)
		) {
			const foundOrganization = dataOrganization.find(
				d => d.type === datum.organizationType,
			);

			if (foundOrganization) {
				foundOrganization.fundsWithType.add(datum.fund);
				foundOrganization.alloctypesWithType.add(
					parseFloat(`${datum.fund}.${datum.allocationType}`),
				);
			} else {
				const type = datum.organizationType;

				const targeted = beneficiaryCategories.reduce(
					(acc, genderAndAge) => {
						acc[genderAndAge] = 0;
						return acc;
					},
					{} as BeneficiariesObject,
				);
				const reached = beneficiaryCategories.reduce(
					(acc, genderAndAge) => {
						acc[genderAndAge] = 0;
						return acc;
					},
					{} as BeneficiariesObject,
				);

				const obj: DatumBarChart = {
					type,
					targeted,
					reached,
					fundsWithType: new Set([datum.fund]),
					alloctypesWithType: new Set([
						parseFloat(`${datum.fund}.${datum.allocationType}`),
					]),
				};

				dataOrganization.push(obj);
			}

			datum.sectorData.forEach(sectorDatum => {
				const foundSector = dataSector.find(
					d => d.type === sectorDatum.sectorId,
				);

				if (foundSector) {
					foundSector.fundsWithType.add(datum.fund);
					foundSector.alloctypesWithType.add(
						parseFloat(`${datum.fund}.${datum.allocationType}`),
					);
				} else {
					const type = sectorDatum.sectorId;

					const targeted = beneficiaryCategories.reduce(
						(acc, genderAndAge) => {
							acc[genderAndAge] = 0;
							return acc;
						},
						{} as BeneficiariesObject,
					);
					const reached = beneficiaryCategories.reduce(
						(acc, genderAndAge) => {
							acc[genderAndAge] = 0;
							return acc;
						},
						{} as BeneficiariesObject,
					);

					const obj: DatumBarChart = {
						type,
						targeted,
						reached,
						fundsWithType: new Set([datum.fund]),
						alloctypesWithType: new Set([
							parseFloat(`${datum.fund}.${datum.allocationType}`),
						]),
					};

					dataSector.push(obj);
				}
			});
		}
	});

	dataOrganization.forEach(org => {
		//if there is no allocation type or allocation source selection, we use the regular BDT2 API call
		if (allAllocationTypesSelected && allSourcesSelected) {
			fund.forEach(pf => {
				if (!org.fundsWithType.has(pf)) {
					return;
				}

				year.forEach(selectedYear => {
					const thisFund =
						totalBeneficiariesByPartnerData[selectedYear][pf];

					if (!thisFund) {
						simpleWarn(
							`Pooled fund code ${pf} not found in the totalBeneficiariesByPartner data for year ${selectedYear}`,
						);
						return;
					}

					addFundFigures(
						org,
						thisFund,
						d => d.partner === org.type,
						statuses,
						allStatusesSelected,
						`Partner ${org.type} not found in totalBeneficiariesByPartner data for fund ${pf}`,
					);
				});
			});
		} else {
			//if there is selection of allocation type or allocation source, we use the call with allocation types
			allocationType.forEach(allocType => {
				//Check if it has the allocation source
				const hasSource = allocationSource.some(source =>
					lists.allocTypesPerSource[source].has(allocType),
				);

				if (!hasSource || !org.alloctypesWithType.has(allocType)) {
					return;
				}

				year.forEach(selectedYear => {
					const thisAllocType =
						totalBeneficiariesByPartnerWithAllocTypeData[
							selectedYear
						][allocType];

					if (!thisAllocType) {
						simpleWarn(
							`Allocation type code ${allocType} (pooled fund + "." +allocation type) not found in the totalBeneficiaries data for year ${selectedYear}`,
						);
						return;
					}

					addFundFigures(
						org,
						thisAllocType,
						d => d.partner === org.type,
						statuses,
						allStatusesSelected,
						`Partner ${org.type} not found in totalBeneficiariesByPartner data for allocation type code ${allocType} (pooled fund + "." +allocation type)`,
					);
				});
			});
		}
	});

	dataSector.forEach(sect => {
		//if there is no allocation type or allocation source selection, we use the regular BDT2 API call
		if (allAllocationTypesSelected && allSourcesSelected) {
			fund.forEach(pf => {
				if (!sect.fundsWithType.has(pf)) {
					return;
				}

				year.forEach(selectedYear => {
					const thisFund =
						totalBeneficiariesBySectorData[selectedYear][pf];

					if (!thisFund) {
						simpleWarn(
							`Pooled fund code ${pf} not found in the totalBeneficiariesBySector data for year ${selectedYear}`,
						);
						return;
					}

					addFundFigures(
						sect,
						thisFund,
						d => d.sector === sect.type,
						statuses,
						allStatusesSelected,
						`Sector ${sect.type} not found in totalBeneficiariesBySector data for fund ${pf}`,
					);
				});
			});
		} else {
			//if there is selection of allocation type or allocation source, we use the call with allocation types
			allocationType.forEach(allocType => {
				const hasSource = allocationSource.some(source =>
					lists.allocTypesPerSource[source].has(allocType),
				);

				if (!hasSource || !sect.alloctypesWithType.has(allocType)) {
					return;
				}

				year.forEach(selectedYear => {
					const thisAllocType =
						totalBeneficiariesBySectorWithAllocTypeData[
							selectedYear
						][allocType];

					if (!thisAllocType) {
						simpleWarn(
							`Allocation type code ${allocType} (pooled fund + "." +allocation type) not found in the totalBeneficiariesBySector data for year ${selectedYear}`,
						);
						return;
					}

					addFundFigures(
						sect,
						thisAllocType,
						d => d.sector === sect.type,
						statuses,
						allStatusesSelected,
						`Sector ${sect.type} not found in totalBeneficiariesBySector data for allocation type code ${allocType} (pooled fund + "." +allocation type)`,
					);
				});
			});
		}
	});

	dataBeneficiaryByType.forEach(benType => {
		//if there is no allocation type or allocation source selection, we use the regular BDT2 API call
		if (allAllocationTypesSelected && allSourcesSelected) {
			fund.forEach(pf => {
				if (
					!inDataLists.fundsPerBeneficiaryType[benType.type].has(pf)
				) {
					return;
				}

				year.forEach(selectedYear => {
					const thisFund =
						totalBeneficiariesByBeneficiaryTypeData[selectedYear][
							pf
						];
					if (!thisFund) {
						simpleWarn(
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
		} else {
			//if there is selection of allocation type or allocation source, we use the call with allocation types
			allocationType.forEach(allocType => {
				const hasSource = allocationSource.some(source =>
					lists.allocTypesPerSource[source].has(allocType),
				);

				if (!hasSource || !benType.alloctypesWithType.has(allocType)) {
					return;
				}

				year.forEach(selectedYear => {
					const thisAllocType =
						totalBeneficiariesByBeneficiaryTypeWithAllocTypeData[
							selectedYear
						][allocType];

					if (!thisAllocType) {
						simpleWarn(
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
}

type GenderBreakdown = {
	[key in GenderAndAge]: { targeted: number; reached: number };
};

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
			simpleWarn(warnMessage);
			return;
		}
		fundFigures = allDatum;
	} else {
		const statusData = statuses.map(st => {
			const found = thisFundData[st]?.find(matches);
			if (!found) simpleWarn(`${warnMessage} and status ${st}`);
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

export default processDataBarChart;
