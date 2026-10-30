import {
	Data,
	FundWithAllocType,
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
	allocationType: FundWithAllocType[];
	lists: List;
};

type ProcessDataStatusesBeneficiariesParams = {
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesWithAllocTypeData: TotalBeneficiariesWithAllocTypeData;
	fund: number[];
	lists: List;
	year: number[];
	allocationSource: number[];
	allocationType: FundWithAllocType[];
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
	const dataStatusesBeneficiariesForAllocType: DataStatusesBeneficiaries = {};

	const warnings: string[] = [];

	//We always use the regular BDT2 API call because this fund-based object will be used to cap the alloctype object
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
				const status = lists.statuses[+st] as ImplementationStatuses;
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
					const thisStatus = (dataStatusesBeneficiariesForAllocType[
						status
					] ??= {
						targeted: 0,
						reached: 0,
					});
					thisStatus.targeted += statusData.total.targeted;
					thisStatus.reached += statusData.total.reached;
				});
			});
		});

		(
			Object.keys(
				dataStatusesBeneficiariesForAllocType,
			) as ImplementationStatuses[]
		).forEach(key => {
			if (
				dataStatusesBeneficiariesForAllocType[key] &&
				dataStatusesBeneficiaries[key]
			) {
				dataStatusesBeneficiariesForAllocType[key].targeted = Math.min(
					dataStatusesBeneficiariesForAllocType[key].targeted,
					dataStatusesBeneficiaries[key].targeted,
				);
				dataStatusesBeneficiariesForAllocType[key].reached = Math.min(
					dataStatusesBeneficiariesForAllocType[key].reached,
					dataStatusesBeneficiaries[key].reached,
				);
			}
		});
	}

	if (!isProdSite && warnings.length) {
		console.warn(warnings);
	}

	return allAllocationTypesSelected && allSourcesSelected
		? dataStatusesBeneficiaries
		: dataStatusesBeneficiariesForAllocType;
}

export default processDataStatuses;
