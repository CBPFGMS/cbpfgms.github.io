import { Data, TotalBeneficiariesData } from "./processrawdata";
import { List } from "./makelists";
import { InDataLists } from "./processrawdata";
import { ImplementationStatuses, Tranche } from "../components/MainContainer";
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

export function processDataStatusesBeneficiaries({
	totalBeneficiariesData,
	fund,
	lists,
}: {
	totalBeneficiariesData: TotalBeneficiariesData;
	fund: number[];
	lists: List;
}): DataStatusesBeneficiaries {
	const dataStatusesBeneficiaries: DataStatusesBeneficiaries = {};

	fund.forEach(pf => {
		const thisFundData = totalBeneficiariesData[pf];
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

	return dataStatusesBeneficiaries;
}

export default processDataStatuses;
