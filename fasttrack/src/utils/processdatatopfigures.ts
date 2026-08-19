import type { Data, TotalBeneficiariesData } from "./processrawdata";
import { simpleWarn } from "./warninvalid";

export type InSelectionData = {
	funds: Set<number>;
	statuses: Set<number>;
};

type ProcessDataTopFiguresParams = {
	data: Data;
	fund: number[];
	status: number[];
	totalBeneficiariesData: TotalBeneficiariesData;
};

export type DataTopFigures = {
	numberOfProjects: number;
	numberOfPartners: number;
	allocations: number;
	targeted: number;
	reached: number;
	reachedProjects: number;
};

function processDataTopFigures({
	data,
	fund,
	status,
	totalBeneficiariesData,
}: ProcessDataTopFiguresParams): {
	dataTopFigures: DataTopFigures;
	inSelectionData: InSelectionData;
} {
	const numberOfProjectsSet = new Set<number>(),
		numberOfPartnersSet = new Set<number>(),
		inSelectionData: InSelectionData = {
			funds: new Set<number>(),
			statuses: new Set<number>(),
		};

	let allocations = 0,
		targeted = 0,
		reached = 0,
		reachedProjects = 0;

	fund.forEach(pf => {
		if (!totalBeneficiariesData[pf]) {
			simpleWarn(
				`Pooled fund code ${pf} not found in the totalBeneficiaries data`,
			);
			return;
		}

		targeted += totalBeneficiariesData[pf].targeted;
		reached += totalBeneficiariesData[pf].reached;
		reachedProjects += totalBeneficiariesData[pf].reachedProjects;
	});

	data.forEach(row => {
		if (fund.includes(row.fund) && status.includes(row.projectStatus)) {
			numberOfProjectsSet.add(row.projectId);
			numberOfPartnersSet.add(row.organizationId);
			allocations += row.budget;
		}
		if (status.includes(row.projectStatus)) {
			inSelectionData.funds.add(row.fund);
		}

		if (fund.includes(row.fund)) {
			inSelectionData.statuses.add(row.projectStatus);
		}
	});

	const dataTopFigures: DataTopFigures = {
		numberOfProjects: numberOfProjectsSet.size,
		numberOfPartners: numberOfPartnersSet.size,
		allocations,
		targeted,
		reached,
		reachedProjects,
	};

	return { dataTopFigures, inSelectionData };
}

export default processDataTopFigures;
