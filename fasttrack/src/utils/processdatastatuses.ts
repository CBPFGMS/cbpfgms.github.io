import type { Tranche } from "../components/MainContainer";
import type {
	Data,
	InDataLists,
	TotalBeneficiariesData,
} from "./processrawdata";

export type DataStatuses = {
	[key: number]: number;
};

export type DataStatusesBeneficiaries = {
	[key: number]: { targeted: number; reached: number };
};

type ProcessDataStatusesParams = {
	data: Data;
	fund: number[];
	setStatus: React.Dispatch<React.SetStateAction<number[]>>;
	tranche: Tranche;
	inDataLists: InDataLists;
};

function processDataStatuses({
	data,
	fund,
	setStatus,
	tranche,
	inDataLists,
}: ProcessDataStatusesParams): DataStatuses {
	const dataStatuses: DataStatuses = {};

	data.forEach(datum => {
		if (
			fund.includes(datum.fund) &&
			(tranche === "all" ||
				inDataLists.projectsPerTranche[tranche]?.has(datum.projectCode))
		) {
			dataStatuses[datum.projectStatus] =
				(dataStatuses[datum.projectStatus] ?? 0) + datum.budget;
		}
	});

	setStatus(Object.keys(dataStatuses).map(d => +d));

	return dataStatuses;
}

export function processDataStatusesBeneficiaries({
	totalBeneficiariesData,
	fund,
}: {
	totalBeneficiariesData: TotalBeneficiariesData;
	fund: number[];
}): DataStatusesBeneficiaries {
	const dataStatusesBeneficiaries: DataStatusesBeneficiaries = {};

	fund.forEach(pf => {
		const thisFundData = totalBeneficiariesData[pf];
		if (!thisFundData) return;

		Object.entries(thisFundData).forEach(([st, statusData]) => {
			if (st === "all") return;
			const thisStatus = (dataStatusesBeneficiaries[+st] ??= {
				targeted: 0,
				reached: 0,
			});
			thisStatus.targeted += statusData.targeted;
			thisStatus.reached += statusData.reached;
		});
	});

	return dataStatusesBeneficiaries;
}

export default processDataStatuses;
