import type { AllocationsData, TotalBeneficiariesData } from "./processrawdata";
import { simpleWarn } from "./warninvalid";
import { constants } from "./constants";

export type InSelectionData = {
	funds: Set<number>;
	statuses: Set<number>;
};

type ProcessDataTopFiguresParams = {
	allocationsData: AllocationsData;
	funds: number[];
	totalBeneficiariesData: TotalBeneficiariesData;
	globalAttribution: number;
	year: number;
	hasUS: boolean;
};

export type DataTopFigures = {
	numberOfProjects: number;
	numberOfPartners: number;
	allocations: number;
	targeted: number;
	reached: number;
};

const { USProjectsString } = constants;

function processDataTopFigures({
	allocationsData,
	funds,
	totalBeneficiariesData,
	globalAttribution,
	year,
	hasUS,
}: ProcessDataTopFiguresParams): DataTopFigures {
	const numberOfProjectsSet = new Set<number>(),
		numberOfPartnersSet = new Set<number>();

	let allocations = 0,
		targeted = 0,
		reached = 0;

	funds.forEach(pf => {
		if (!totalBeneficiariesData[year]) {
			simpleWarn(`Year ${year} not found in the totalBeneficiaries data`);
			return;
		}
		if (!totalBeneficiariesData[year][pf]) {
			simpleWarn(
				`Pooled fund code ${pf}, present in the attributions data, was not found in the totalBeneficiaries data (allocations) for year ${year}`,
			);
			return;
		}

		const thisYearData = totalBeneficiariesData[year];

		targeted += thisYearData[pf].total.targeted;
		reached += thisYearData[pf].total.reached;
	});

	allocationsData.forEach(row => {
		if (!hasUS && row.projectCode.includes(USProjectsString)) {
			return;
		}
		if (funds.includes(row.fund) && row.year === year) {
			numberOfProjectsSet.add(row.projectId);
			numberOfPartnersSet.add(row.organizationId);
			allocations += row.budget;
		}
	});

	//multiply by global attribution
	allocations *= globalAttribution;
	targeted *= globalAttribution;
	reached *= globalAttribution;

	const dataTopFigures: DataTopFigures = {
		numberOfProjects: numberOfProjectsSet.size,
		numberOfPartners: numberOfPartnersSet.size,
		allocations,
		targeted,
		reached,
	};

	return dataTopFigures;
}

export default processDataTopFigures;
