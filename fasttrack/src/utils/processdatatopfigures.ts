import type { Tranche } from "../components/MainContainer";
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
	tranche: Tranche;
	inDataLists: InDataLists;
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
	tranche,
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
		targeted = 0,
		reached = 0,
		reachedProjects = 0;

	//every status in the filter is selected (default): use the unique
	//("all") figures. Otherwise always add the selected statuses
	//individually, even if a fund has all of its own statuses selected.
	//Statuses can overlap (same people in several statuses), so each fund's
	//sum is limited to that fund's unique total
	const allStatusesSelected = [...inDataLists.projectStatuses].every(st =>
		status.includes(st),
	);

	fund.forEach(pf => {
		if (!totalBeneficiariesData[pf]) {
			simpleWarn(
				`Pooled fund code ${pf} not found in the totalBeneficiaries data`,
			);
			return;
		}

		if (allStatusesSelected) {
			targeted += totalBeneficiariesData[pf].all.targeted;
			reached += totalBeneficiariesData[pf].all.reached;
			reachedProjects += totalBeneficiariesData[pf].all.reachedProjects;
		} else {
			const capped = capToFundTotal(
				sumSelectedStatuses(totalBeneficiariesData, pf, status),
				totalBeneficiariesData[pf].all,
			);
			targeted += capped.targeted;
			reached += capped.reached;
			reachedProjects += capped.reachedProjects;
		}
	});

	data.forEach(row => {
		if (
			tranche !== "all" &&
			!inDataLists.projectsPerTranche[tranche]?.has(row.projectCode)
		) {
			return;
		}

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

type Figures = { targeted: number; reached: number; reachedProjects: number };

export function sumSelectedStatuses(
	totalBeneficiariesData: TotalBeneficiariesData,
	pf: number,
	status: number[],
): Figures {
	const fundSum = { targeted: 0, reached: 0, reachedProjects: 0 };
	status.forEach(st => {
		fundSum.targeted += totalBeneficiariesData[pf][st]?.targeted || 0;
		fundSum.reached += totalBeneficiariesData[pf][st]?.reached || 0;
		fundSum.reachedProjects +=
			totalBeneficiariesData[pf][st]?.reachedProjects || 0;
	});
	return fundSum;
}

export function capToFundTotal(sum: Figures, fundTotal: Figures): Figures {
	return {
		targeted: fundTotal.targeted
			? Math.min(sum.targeted, fundTotal.targeted)
			: sum.targeted,
		reached: fundTotal.reached
			? Math.min(sum.reached, fundTotal.reached)
			: sum.reached,
		reachedProjects: fundTotal.reachedProjects
			? Math.min(sum.reachedProjects, fundTotal.reachedProjects)
			: sum.reachedProjects,
	};
}

export default processDataTopFigures;
