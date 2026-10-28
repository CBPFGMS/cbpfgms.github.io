import {
	Data,
	TotalBeneficiariesData,
	TotalBeneficiariesWithAllocTypeData,
} from "./processrawdata";
import { List } from "./makelists";
import { ImplementationStatuses } from "../components/MainContainer";
import constants from "./constants";

export type DataStatuses = {
	[K in ImplementationStatuses]: number;
};

export type DataStatusesBeneficiaries = {
	[K in ImplementationStatuses]?: { targeted: number; reached: number };
};

type ProcessDataStatusesParams = {
	data: Data;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	lists: List;
};

type ProcessDataStatusesBeneficiariesParams = {
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesWithAllocTypeData: TotalBeneficiariesWithAllocTypeData;
	fund: number[];
	lists: List;
	year: number[];
	allocationSource: number[];
	allocationType: number[];
	allAllocationTypesSelected: boolean;
	allSourcesSelected: boolean;
};

const { implementationStatuses, isProdSite } = constants;

function processDataStatuses({
	data,
	year,
	fund,
	allocationSource,
	allocationType,
	lists,
}: ProcessDataStatusesParams): DataStatuses {
	const dataStatuses: DataStatuses = implementationStatuses.reduce(
		(acc, curr) => {
			acc[curr] = 0;
			return acc;
		},
		{} as DataStatuses,
	);

	data.forEach(datum => {
		const status = lists.statuses[
			datum.projectStatusId
		] as keyof DataStatuses;
		if (
			year.includes(datum.year) &&
			fund.includes(datum.fund) &&
			allocationSource.includes(datum.allocationSource) &&
			allocationType.includes(datum.allocationType)
		) {
			dataStatuses[status] += datum.budget;
		}
	});

	return dataStatuses;
}

export function processDataStatusesBeneficiaries({
	totalBeneficiariesData,
	totalBeneficiariesWithAllocTypeData,
	fund,
	lists,
	year,
	allocationType,
	allocationSource,
	allSourcesSelected,
	allAllocationTypesSelected,
}: ProcessDataStatusesBeneficiariesParams): DataStatusesBeneficiaries {
	const dataStatusesBeneficiaries: DataStatusesBeneficiaries = {};

	const warnings: string[] = [];

	//if there is no allocation type or allocation source selection, we use the regular BDT2 API call
	if (allAllocationTypesSelected && allSourcesSelected) {
		fund.forEach(pf => {
			year.forEach(selectedYear => {
				const thisFundData = totalBeneficiariesData[selectedYear][pf];
				if (!thisFundData) {
					warnings.push(
						`Pooled fund code ${pf} not found in the totalBeneficiaries data for year ${selectedYear}`,
					);
					return;
				}

				Object.entries(thisFundData).forEach(([st, statusData]) => {
					if (st === "all") return;
					const status = lists.statuses[
						+st
					] as ImplementationStatuses;
					if (!status) return;
					const thisStatus = (dataStatusesBeneficiaries[status] ??= {
						targeted: 0,
						reached: 0,
					});
					thisStatus.targeted += statusData.total.targeted;
					thisStatus.reached += statusData.total.reached;
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
					totalBeneficiariesWithAllocTypeData[selectedYear][
						allocType
					];
				if (!thisAllocData) {
					warnings.push(
						`Allocation type code ${allocType} (pooled fund + "." +allocation type) not found in the totalBeneficiaries data for year ${selectedYear}`,
					);
					return;
				}

				Object.entries(thisAllocData).forEach(([st, statusData]) => {
					if (st === "all") return;
					const status = lists.statuses[
						+st
					] as ImplementationStatuses;
					if (!status) return;
					const thisStatus = (dataStatusesBeneficiaries[status] ??= {
						targeted: 0,
						reached: 0,
					});
					thisStatus.targeted += statusData.total.targeted;
					thisStatus.reached += statusData.total.reached;
				});
			});
		});
	}

	if (!isProdSite) {
		console.warn(warnings);
	}

	return dataStatusesBeneficiaries;
}

export default processDataStatuses;
