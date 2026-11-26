import type { AllocationsLollipopObject } from "./schemas";

type ProcessLollipopDataParams = {
	allocationsLollipopData: AllocationsLollipopObject[];
	allocationsLollipopWithoutUSData: AllocationsLollipopObject[];
	year: number;
	hasUS: boolean;
	globalAttribution: number;
};

function processLollipopData({
	allocationsLollipopData,
	allocationsLollipopWithoutUSData,
	year,
	hasUS,
	globalAttribution,
}: ProcessLollipopDataParams): AllocationsLollipopObject[] {
	const lollipopData = [] as AllocationsLollipopObject[];

	const dataToIterate = hasUS
		? allocationsLollipopData
		: allocationsLollipopWithoutUSData;

	dataToIterate.forEach(row => {
		if (row.AllocationYear === year) {
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
