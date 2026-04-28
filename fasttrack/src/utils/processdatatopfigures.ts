import type {
	Data,
	InDataLists,
	TotalBeneficiariesData,
} from "./processrawdata";
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
	inDataLists: InDataLists;
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
	totalBeneficiariesData,
	inDataLists,
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

	fund.forEach(pf => {
		if (!totalBeneficiariesData[pf]) {
			simpleWarn(
				`Pooled fund code ${pf} not found in the totalBeneficiaries data`,
			);
			return;
		}

		const allStatuses = [...inDataLists.statusesPerFund[pf]];
		const fundHasAllStatuses = allStatuses.every(pfStatus =>
			status.includes(pfStatus),
		);
		if (fundHasAllStatuses) {
			targeted += totalBeneficiariesData[pf].all;
		} else {
			status.forEach(st => {
				targeted += totalBeneficiariesData[pf][st] || 0;
			});
		}
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
	};

	return { dataTopFigures, inSelectionData };
}

export default processDataTopFigures;
