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

	//total of the selected funds with all statuses (used for the cap)
	let allTargeted = 0,
		allReached = 0,
		allReachedProjects = 0;

	fund.forEach(pf => {
		if (!totalBeneficiariesData[pf]) {
			simpleWarn(
				`Pooled fund code ${pf} not found in the totalBeneficiaries data`,
			);
			return;
		}

		const allStatuses = [
			...((tranche === "all"
				? inDataLists.statusesPerFund[pf]
				: inDataLists.statusesPerFundPerTranche[tranche]?.[pf]) ?? []),
		];
		const fundHasAllStatuses = allStatuses.every(pfStatus =>
			status.includes(pfStatus),
		);

		allTargeted += totalBeneficiariesData[pf].all.targeted;
		allReached += totalBeneficiariesData[pf].all.reached;
		allReachedProjects += totalBeneficiariesData[pf].all.reachedProjects;

		if (fundHasAllStatuses) {
			targeted += totalBeneficiariesData[pf].all.targeted;
			reached += totalBeneficiariesData[pf].all.reached;
			reachedProjects += totalBeneficiariesData[pf].all.reachedProjects;
		} else {
			status.forEach(st => {
				targeted += totalBeneficiariesData[pf][st]?.targeted || 0;
				reached += totalBeneficiariesData[pf][st]?.reached || 0;
				reachedProjects +=
					totalBeneficiariesData[pf][st]?.reachedProjects || 0;
			});
		}
	});

	//statuses can overlap (same people in several statuses): a subset
	//of statuses can never be higher than the total with all statuses
	if (allTargeted) targeted = Math.min(targeted, allTargeted);
	if (allReached) reached = Math.min(reached, allReached);
	if (allReachedProjects)
		reachedProjects = Math.min(reachedProjects, allReachedProjects);

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

export default processDataTopFigures;
