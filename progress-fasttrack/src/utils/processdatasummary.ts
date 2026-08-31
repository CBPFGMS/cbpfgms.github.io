import { Data } from "./processrawdata";
import { List } from "./makelists";
import { ImplementationStatuses } from "../components/MainContainer";
import constants from "./constants";

export type InSelectionData = {
	years: Set<number>;
	funds: Set<number>;
	allocationSources: Set<number>;
	allocationTypes: Set<number>;
	statuses: Set<ImplementationStatuses>;
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

export type DatumGBV = {
	allocations: number;
	allocationsGBVPlanned: number;
	allocationsGBVReached: number;
	targeted: number;
	targetedGBV: number;
	reached: number;
	reachedGBV: number;
} & Report;

export type Report = {
	totalReports: number;
	reportsWithData: number;
};

type CvaReachedAndTargeted = {
	targetedAllocations: number;
	reachedAllocations: number;
};

type CvaSector = {
	sector: number;
} & CvaReachedAndTargeted;

export type DatumCva = {
	cvaType: (typeof cvaChartTypes)[number];
	sectorData: CvaSector[];
} & CvaReachedAndTargeted;

const { reportsForGBV, cvaChartTypes } = constants;

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
	dataCva: DatumCva[];
	dataGBV: DatumGBV;
	inSelectionData: InSelectionData;
} {
	const dataSummary: DatumSummary[] = [];
	const dataCva: DatumCva[] = [];

	const dataGBV: DatumGBV = {
		allocations: 0,
		allocationsGBVPlanned: 0,
		allocationsGBVReached: 0,
		targeted: 0,
		targetedGBV: 0,
		reached: 0,
		reachedGBV: 0,
		totalReports: 0,
		reportsWithData: 0,
	};
	const inSelectionData: InSelectionData = {
		years: new Set(),
		funds: new Set(),
		allocationSources: new Set(),
		allocationTypes: new Set(),
		statuses: new Set(),
	};

	data.forEach(datum => {
		const thisStatus = lists.statuses[
			datum.projectStatusId
		] as ImplementationStatuses;
		if (
			implementationStatus.includes(thisStatus) &&
			year.includes(datum.year) &&
			fund.includes(datum.fund) &&
			allocationSource.includes(datum.allocationSource) &&
			allocationType.includes(datum.allocationType)
		) {
			const foundYear = dataSummary.find(
				summary => summary.year === datum.year,
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
						"Under Implementation",
					)
						? datum.budget
						: 0,
				});
			}

			dataGBV.allocations += datum.budget;
			dataGBV.allocationsGBVPlanned += datum.budgetGBVPlanned;
			dataGBV.allocationsGBVReached += datum.budgetGBVReached;
			dataGBV.targeted += Object.values(datum.targeted).reduce(
				(acc, curr) => acc + curr,
				0,
			);
			dataGBV.targetedGBV += datum.targetedGBV;
			dataGBV.reached += Object.values(datum.reached).reduce(
				(acc, curr) => acc + curr,
				0,
			);
			dataGBV.reachedGBV += datum.reachedGBV;
			dataGBV.totalReports += 1;
			if (
				reportsForGBV.includes(
					datum.reportType as (typeof reportsForGBV)[number],
				)
			) {
				dataGBV.reportsWithData += 1;
			}

			if (datum.cvaData) {
				datum.cvaData.forEach(cva => {
					let cvaDatum = dataCva.find(
						datum => datum.cvaType === cva.cvaId,
					);

					if (!cvaDatum) {
						cvaDatum = {
							cvaType:
								cva.cvaId as (typeof cvaChartTypes)[number],
							sectorData: [],
							targetedAllocations: 0,
							reachedAllocations: 0,
						};
						dataCva.push(cvaDatum);
					}

					let sectorData = cvaDatum.sectorData.find(
						sector => sector.sector === cva.sectorId,
					);

					if (!sectorData) {
						sectorData = {
							sector: cva.sectorId,
							targetedAllocations: 0,
							reachedAllocations: 0,
						};
						cvaDatum.sectorData.push(sectorData);
					}

					sectorData.targetedAllocations += cva.targetedAllocations;
					sectorData.reachedAllocations += cva.reachedAllocations;
					cvaDatum.targetedAllocations += cva.targetedAllocations;
					cvaDatum.reachedAllocations += cva.reachedAllocations;
				});
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

		if (
			year.includes(datum.year) &&
			fund.includes(datum.fund) &&
			allocationSource.includes(datum.allocationSource) &&
			allocationType.includes(datum.allocationType)
		) {
			inSelectionData.statuses.add(thisStatus);
		}
	});

	dataSummary.sort((a, b) => b.year - a.year);

	return {
		dataSummary,
		dataCva,
		dataGBV,
		inSelectionData,
	};
}

export default processDataSummary;
