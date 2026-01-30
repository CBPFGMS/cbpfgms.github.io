import { Data } from "./processrawdata";
import { List } from "./makelists";
import calculateStatus from "./calculatestatus";
import { ImplementationStatuses } from "../components/MainContainer";
import constants from "./constants";

export type DataStatuses = {
	[K in Exclude<ImplementationStatuses, "Financially Closed">]: number;
} & Partial<{
	[K in Extract<ImplementationStatuses, "Financially Closed">]: number;
}>;

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
		{} as DataStatuses
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

export default processDataStatuses;
