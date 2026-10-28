import { ImplementationStatuses } from "../components/MainContainer";
import { List } from "./makelists";
import {
	GenderAndAge,
	TotalBeneficiariesData,
	TotalBeneficiariesWithAllocTypeData,
} from "./processrawdata";
import flipObject from "./flipobject";
import constants from "./constants";
import { sumStatusesCapped } from "./sumstatuses";

const totalKeys = ["total", ...constants.beneficiaryCategories] as const;

const { isProdSite } = constants;

type ProcessDataTotalBeneficiariesParams = {
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesWithAllocTypeData: TotalBeneficiariesWithAllocTypeData;
	year: number[];
	fund: number[];
	implementationStatus: ImplementationStatuses[];
	lists: List;
	allocationSource: number[];
	allocationType: number[];
	allStatusesSelected: boolean;
	allAllocationTypesSelected: boolean;
	allSourcesSelected: boolean;
};

export type TargetedAndReachedTotal = {
	targeted: { [key in GenderAndAge | "total"]: number };
	reached: { [key in GenderAndAge | "total"]: number };
};

function processDataTotalBeneficiaries({
	totalBeneficiariesData,
	totalBeneficiariesWithAllocTypeData,
	year,
	fund,
	implementationStatus,
	lists,
	allocationSource,
	allocationType,
	allStatusesSelected,
	allAllocationTypesSelected,
	allSourcesSelected,
}: ProcessDataTotalBeneficiariesParams): TargetedAndReachedTotal {
	const targeted = {
		girls: 0,
		boys: 0,
		women: 0,
		men: 0,
		total: 0,
	};
	const reached = {
		girls: 0,
		boys: 0,
		women: 0,
		men: 0,
		total: 0,
	};

	const warnings: string[] = [];

	const numericStatuses = flipObject(lists.statuses);

	const status = implementationStatus.map(
		implSt => +numericStatuses[implSt as ImplementationStatuses],
	);

	//if there is no allocation type or allocation source selection, we use the regular BDT2 API call
	if (allAllocationTypesSelected && allSourcesSelected) {
		fund.forEach(pf => {
			year.forEach(selectedYear => {
				const thisFundData = totalBeneficiariesData[selectedYear]?.[pf];
				if (!thisFundData) {
					warnings.push(
						`Pooled fund code ${pf} not found in the totalBeneficiaries data for year ${selectedYear}`,
					);
					return;
				}

				const fundFigures = allStatusesSelected
					? thisFundData.all
					: sumStatusesCapped(
							status.map(st => thisFundData[st]),
							thisFundData.all,
							totalKeys,
						);

				totalKeys.forEach(key => {
					targeted[key] += fundFigures[key].targeted;
					reached[key] += fundFigures[key].reached;
				});
			});
		});
	} else {
		//if there is selection of allocation type or allocation source, we use the call with allocation types
		allocationType.forEach(allocType => {
			//Check if it has the allocation source
			const hasSource = allocationSource.some(source =>
				lists.allocTypesPerSource[source].has(allocType),
			);

			if (!hasSource) return;

			year.forEach(selectedYear => {
				const thisAllocData =
					totalBeneficiariesWithAllocTypeData[selectedYear]?.[
						allocType
					];
				if (!thisAllocData) {
					warnings.push(
						`Allocation type code ${allocType} (pooled fund + "." +allocation type) not found in the totalBeneficiaries data for year ${selectedYear}`,
					);
					return;
				}

				const fundFigures = allStatusesSelected
					? thisAllocData.all
					: sumStatusesCapped(
							status.map(st => thisAllocData[st]),
							thisAllocData.all,
							totalKeys,
						);

				totalKeys.forEach(key => {
					targeted[key] += fundFigures[key].targeted;
					reached[key] += fundFigures[key].reached;
				});
			});
		});
	}

	if (!isProdSite) {
		console.warn(warnings);
	}

	return { targeted, reached };
}

export default processDataTotalBeneficiaries;
