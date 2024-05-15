import { Data } from "./processrawdata";
import { List } from "./makelists";
import { ImplementationStatuses } from "../components/MainContainer";
import calculateStatus from "./calculatestatus";

export type InSelectionData = {
	years: Set<number>;
	funds: Set<number>;
	allocationSources: Set<number>;
	allocationTypes: Set<number>;
};

type ProcessDataSummaryParams = {
	data: Data;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationStatus: ImplementationStatuses[];
	lists: List;
};

export type DatumSummary = {
	year: number;
	allocations: number;
	projects: Set<number>;
	partners: Set<number>;
	underImplementation: number;
};

export type DatumPictogram = {
	targetedMen: number;
	targetedWomen: number;
	targetedBoys: number;
	targetedGirls: number;
	reachedMen: number;
	reachedWomen: number;
	reachedBoys: number;
	reachedGirls: number;
};

function processDataSummary({
	data,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	lists,
}: ProcessDataSummaryParams): {
	dataSummary: DatumSummary[];
	dataPictogram: DatumPictogram;
	inSelectionData: InSelectionData;
} {
	const dataSummary: DatumSummary[] = [];
	const dataPictogram: DatumPictogram = {
		targetedMen: 0,
		targetedWomen: 0,
		targetedBoys: 0,
		targetedGirls: 0,
		reachedMen: 0,
		reachedWomen: 0,
		reachedBoys: 0,
		reachedGirls: 0,
	};
	const inSelectionData: InSelectionData = {
		years: new Set(),
		funds: new Set(),
		allocationSources: new Set(),
		allocationTypes: new Set(),
	};

	data.forEach(datum => {
		const thisStatus = calculateStatus(datum, lists);
		if (implementationStatus.includes(thisStatus)) {
			if (
				year.includes(datum.year) &&
				fund.includes(datum.fund) &&
				allocationSource.includes(datum.allocationSource) &&
				allocationType.includes(datum.allocationType)
			) {
				const foundYear = dataSummary.find(
					summary => summary.year === datum.year
				);
				if (foundYear) {
					foundYear.allocations += datum.budget;
					foundYear.projects.add(datum.projectId);
					foundYear.partners.add(datum.organizationId);
					if (thisStatus.includes("Under Implementation")) {
						foundYear.underImplementation += datum.budget;
					}
				} else {
					dataSummary.push({
						year: datum.year,
						allocations: datum.budget,
						projects: new Set([datum.projectId]),
						partners: new Set([datum.organizationId]),
						underImplementation: thisStatus.includes(
							"Under Implementation"
						)
							? datum.budget
							: 0,
					});
				}

				dataPictogram.targetedMen += datum.targeted.men;
				dataPictogram.targetedWomen += datum.targeted.women;
				dataPictogram.targetedBoys += datum.targeted.boys;
				dataPictogram.targetedGirls += datum.targeted.girls;
				dataPictogram.reachedMen += datum.reached.men;
				dataPictogram.reachedWomen += datum.reached.women;
				dataPictogram.reachedBoys += datum.reached.boys;
				dataPictogram.reachedGirls += datum.reached.girls;
			}
		}

		if (
			year.includes(datum.year) &&
			fund.includes(datum.fund) &&
			allocationSource.includes(datum.allocationSource)
		) {
			inSelectionData.allocationTypes.add(datum.allocationType);
		}
		if (
			year.includes(datum.year) &&
			fund.includes(datum.fund) &&
			allocationType.includes(datum.allocationType)
		) {
			inSelectionData.allocationSources.add(datum.allocationSource);
		}
		if (
			year.includes(datum.year) &&
			allocationSource.includes(datum.allocationSource) &&
			allocationType.includes(datum.allocationType)
		) {
			inSelectionData.funds.add(datum.fund);
		}
		if (
			fund.includes(datum.fund) &&
			allocationSource.includes(datum.allocationSource) &&
			allocationType.includes(datum.allocationType)
		) {
			inSelectionData.years.add(datum.year);
		}
	});

	return { dataSummary, dataPictogram, inSelectionData };
}

export default processDataSummary;
