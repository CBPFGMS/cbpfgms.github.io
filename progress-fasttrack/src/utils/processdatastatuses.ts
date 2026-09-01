import { Data } from "./processrawdata";
import { List } from "./makelists";
import { InDataLists } from "./processrawdata";
import { ImplementationStatuses, Tranche } from "../components/MainContainer";
import constants from "./constants";

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
	inDataLists: InDataLists;
	tranche: Tranche;
};

const { implementationStatuses } = constants;

function processDataStatuses({
	data,
	year,
	fund,
	allocationSource,
	allocationType,
	lists,
	inDataLists,
	tranche,
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
			allocationType.includes(datum.allocationType) &&
			(tranche === "all" ||
				inDataLists.projectsPerTranche[tranche]?.has(datum.projectCode))
		) {
			dataStatuses[status] += datum.budget;
		}
	});

	return dataStatuses;
}

export default processDataStatuses;
