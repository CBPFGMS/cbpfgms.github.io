import type { List } from "./makelists";
import type { AllocationsLollipopObject } from "./schemas";

type ProcessLollipopDataParams = {
	allocationsLollipopData: AllocationsLollipopObject[];
	allocationsLollipopWithoutUSData: AllocationsLollipopObject[];
	funds: number[];
	year: number;
	hasUS: boolean;
	lists: List;
	globalAttribution: number;
};

function processLollipopData({
	allocationsLollipopData,
	allocationsLollipopWithoutUSData,
	funds,
	year,
	hasUS,
	lists,
	globalAttribution,
}: ProcessLollipopDataParams): AllocationsLollipopObject[] {
	const lollipopData = [] as AllocationsLollipopObject[];

	const dataToIterate = hasUS
		? allocationsLollipopData
		: allocationsLollipopWithoutUSData;

	dataToIterate.forEach(row => {
		const hasFund = funds.some(
			f => lists.fundNames[f] === row.PooledFundName,
		);

		const hasYear = row.AllocationYear === year;

		if (hasFund && hasYear) {
			const copiedRow = { ...row };

			copiedRow.ApprovedReserveBudget *= globalAttribution;
			copiedRow.ApprovedStandardBudget *= globalAttribution;
			copiedRow.ApprovedBudget *= globalAttribution;
			copiedRow.PipelineReserveBudget *= globalAttribution;
			copiedRow.PipelineStandardBudget *= globalAttribution;
			copiedRow.PipelineBudget *= globalAttribution;

			lollipopData.push(copiedRow);
		}
	});

	return lollipopData;
}

export default processLollipopData;
