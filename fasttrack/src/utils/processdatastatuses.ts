import type { Data } from "./processrawdata";

export type DataStatuses = {
	[key: number]: number;
};

type ProcessDataStatusesParams = {
	data: Data;
	fund: number[];
	setStatus: React.Dispatch<React.SetStateAction<number[]>>;
};

function processDataStatuses({
	data,
	fund,
	setStatus,
}: ProcessDataStatusesParams): DataStatuses {
	const dataStatuses: DataStatuses = {};

	data.forEach(datum => {
		if (fund.includes(datum.fund)) {
			dataStatuses[datum.projectStatus] =
				(dataStatuses[datum.projectStatus] ?? 0) + datum.budget;
		}
	});

	setStatus(Object.keys(dataStatuses).map(d => +d));

	return dataStatuses;
}

export default processDataStatuses;
