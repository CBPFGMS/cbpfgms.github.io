import type { Data } from "./processrawdata";

export type InSelectionData = {
	funds: Set<number>;
};

type ProcessDataTopFiguresParams = {
	data: Data;
	fund: number[];
};

export type DataTopFigures = {
	numberOfProjects: number;
	numberOfPartners: number;
	allocations: number;
	days: number;
};

function processDataTopFigures({ data, fund }: ProcessDataTopFiguresParams): {
	dataTopFigures: DataTopFigures;
	inSelectionData: InSelectionData;
} {
	const numberOfProjectsSet = new Set<number>(),
		numberOfPartnersSet = new Set<number>(),
		daysExtent: [number, number] = [Infinity, -Infinity],
		inSelectionData: InSelectionData = {
			funds: new Set<number>(),
		};

	let allocations = 0;

	data.forEach(row => {
		if (fund.includes(row.fund)) {
			numberOfProjectsSet.add(row.projectId);
			numberOfPartnersSet.add(row.organizationId);
			allocations += row.budget;
			daysExtent[0] = Math.min(daysExtent[0], row.approvalDate.getTime());
			daysExtent[1] = Math.max(daysExtent[1], row.endDate.getTime());
		}
		inSelectionData.funds.add(row.fund);
	});

	const dataTopFigures: DataTopFigures = {
		numberOfProjects: numberOfProjectsSet.size,
		numberOfPartners: numberOfPartnersSet.size,
		allocations,
		days: Math.ceil((daysExtent[1] - daysExtent[0]) / (1000 * 3600 * 24)),
	};

	return { dataTopFigures, inSelectionData };
}

export default processDataTopFigures;
