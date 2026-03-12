import type { Data } from "./processrawdata";

export type InSelectionData = {
	funds: Set<number>;
	statuses: Set<number>;
};

type ProcessDataTopFiguresParams = {
	data: Data;
	fund: number[];
	status: number[];
};

export type DataTopFigures = {
	numberOfProjects: number;
	numberOfPartners: number;
	allocations: number;
	targeted: number;
};

function processDataTopFigures({
	data,
	fund,
	status,
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
		targeted = 0;

	data.forEach(row => {
		if (fund.includes(row.fund) && status.includes(row.projectStatus)) {
			const totalTargeted =
				row.targeted.boys +
				row.targeted.girls +
				row.targeted.men +
				row.targeted.women;
			numberOfProjectsSet.add(row.projectId);
			numberOfPartnersSet.add(row.organizationId);
			allocations += row.budget;
			targeted += totalTargeted;
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
	};

	return { dataTopFigures, inSelectionData };
}

export default processDataTopFigures;
