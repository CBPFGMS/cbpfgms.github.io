import { Data } from "./processrawdata";
import { List } from "./makelists";
import calculateStatus from "./calculatestatus";
import { ImplementationStatuses } from "../components/MainContainer";

export type DataStatuses = {
	[K in ImplementationStatuses]: number;
};

type ProcessDataStatusesParams = {
	data: Data;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	lists: List;
};

function processDataStatuses({
	data,
	year,
	fund,
	allocationSource,
	allocationType,
	lists,
}: ProcessDataStatusesParams): DataStatuses {
	const dataStatuses: DataStatuses = {
		"Under Implementation": 0,
		"Under Closure/Closed": 0,
		Implemented: 0,
	};

	data.forEach(datum => {
		const status = calculateStatus(datum, lists);
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
