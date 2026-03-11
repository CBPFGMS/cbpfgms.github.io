import type { Data } from "./processrawdata";
import type { Statuses } from "../components/MainContainer";

export type DataStatuses = {
	[K in Statuses]: number;
};

type ProcessDataStatusesParams = {
	data: Data;
	fund: number[];
};

function processDataStatuses({
	data,
	fund,
}: ProcessDataStatusesParams): DataStatuses {
	const dataStatuses: DataStatuses = {
		0: 0,
		1: 0,
	};

	data.forEach(datum => {
		if (fund.includes(datum.fund)) {
			dataStatuses[datum.projectStatus] += datum.budget;
		}
	});

	return dataStatuses;
}

export default processDataStatuses;
