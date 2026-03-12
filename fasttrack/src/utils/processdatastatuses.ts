import type { Data } from "./processrawdata";

export type DataStatuses = {
	[key: number]: number;
};

type ProcessDataStatusesParams = {
	data: Data;
	fund: number[];
};

function processDataStatuses({
	data,
	fund,
}: ProcessDataStatusesParams): DataStatuses {
	const dataStatuses: DataStatuses = {};

	data.forEach(datum => {
		if (fund.includes(datum.fund)) {
			dataStatuses[datum.projectStatus] =
				(dataStatuses[datum.projectStatus] ?? 0) + datum.budget;
		}
	});

	return dataStatuses;
}

export default processDataStatuses;
