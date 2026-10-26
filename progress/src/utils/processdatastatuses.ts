import { Data, TotalBeneficiariesData } from "./processrawdata";
import { List } from "./makelists";
import { ImplementationStatuses } from "../components/MainContainer";
import constants from "./constants";

export type DataStatuses = {
	[K in Exclude<ImplementationStatuses, "Financially Closed">]: number;
} & Partial<{
	[K in Extract<ImplementationStatuses, "Financially Closed">]: number;
}>;

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
	showFinanciallyClosed: boolean;
};

const { implementationStatuses } = constants;

function processDataStatuses({
	data,
	year,
	fund,
	allocationSource,
	allocationType,
	lists,
	showFinanciallyClosed,
}: ProcessDataStatusesParams): DataStatuses {
	const dataStatuses: DataStatuses = implementationStatuses.reduce(
		(acc, curr) => {
			if (curr === "Financially Closed" && !showFinanciallyClosed) {
				return acc;
			}
			acc[curr] = 0;
			return acc;
		},
		{} as DataStatuses,
	);

	data.forEach(datum => {
		const status = calculateStatus(datum, lists, showFinanciallyClosed);
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
	year,
	fund,
	lists,
}: {
	totalBeneficiariesData: TotalBeneficiariesData;
	year: number[];
	fund: number[];
	lists: List;
}): DataStatusesBeneficiaries {
	const dataStatusesBeneficiaries: DataStatusesBeneficiaries = {};

	year.forEach(selectedYear => {
		fund.forEach(pf => {
			const thisFundData = totalBeneficiariesData[selectedYear]?.[pf];
			if (!thisFundData) return;

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

	return dataStatusesBeneficiaries;
}

export default processDataStatuses;
