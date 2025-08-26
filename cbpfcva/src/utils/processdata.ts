import { type Data } from "./processrawdata";
import { type List } from "./makelists";
import constants from "./constants";

type ProcessData = {
	data: Data;
	year: number[];
	organizationType: number[];
	fund: number[];
	lists: List;
};

export type DataTopFigures = {
	totalAllocations: number;
	standardTotal: number;
	reserveTotal: number;
	allocations: number;
	projects: Set<number>;
	partners: Set<number>;
	standard: number;
	reserve: number;
};

export type DatumCvaTypes = {
	cvaType: number;
	allocations: number;
	standard: number;
	reserve: number;
	sectors: DatumSectors[];
};

export type DatumSectors = {
	sector: number;
	allocations: number;
	standard: number;
	reserve: number;
};

export type DatumFunds = {
	fund: number;
	totalAllocations: number;
	cvaAllocations: number;
	standardTotalAllocations: number;
	reserveTotalAllocations: number;
	standardCvaAllocations: number;
	reserveCvaAllocations: number;
	cvaPercentage: number;
};

export type TimelineDatum = {
	year: number;
	[key: `${number}Total`]: number;
	[key: `${number}Cva`]: number;
	[key: `${number}CvaPercentage`]: number;
	total: number;
	cva: number;
	cvaPercentage: number;
};

export type InSelectionData = {
	years: Set<number>;
	organizationTypes: Set<number>;
	funds: Set<number>;
};

export type AllocationSources = (typeof constants.allocationSources)[number];

function processData({
	data,
	year,
	fund,
	organizationType,
	lists,
}: ProcessData): {
	dataTopFigures: DataTopFigures;
	dataCvaTypes: DatumCvaTypes[];
	dataFunds: DatumFunds[];
	timelineData: TimelineDatum[];
	inSelectionData: InSelectionData;
} {
	const inSelectionData: InSelectionData = {
		years: new Set<number>(),
		organizationTypes: new Set<number>(),
		funds: new Set<number>(),
	};

	const dataTopFigures: DataTopFigures = {
		totalAllocations: 0,
		standardTotal: 0,
		reserveTotal: 0,
		allocations: 0,
		projects: new Set<number>(),
		partners: new Set<number>(),
		standard: 0,
		reserve: 0,
	};

	const dataTypes: DatumCvaTypes[] = [];
	const dataFunds: DatumFunds[] = [];
	const timelineData: TimelineDatum[] = [];

	const fundsInTimeline = new Set<number>();

	data.forEach(datum => {
		let thisYear = timelineData.find(d => d.year === datum.year),
			cvaBudget;

		if (!thisYear) {
			thisYear = { year: datum.year, total: 0, cva: 0, cvaPercentage: 0 };
			timelineData.push(thisYear);
		}

		thisYear[`${datum.fund}Total`] =
			(thisYear[`${datum.fund}Total`] || 0) + datum.budget;

		thisYear.total += datum.budget;

		if (datum.cvaData !== null) {
			cvaBudget = datum.cvaData?.reduce(
				(acc, curr) => acc + curr.budget,
				0
			);
			fundsInTimeline.add(datum.fund);
		}

		thisYear[`${datum.fund}Cva`] =
			(thisYear[`${datum.fund}Cva`] || 0) + (cvaBudget || 0);

		thisYear.cva += cvaBudget || 0;

		if (
			year.includes(datum.year) &&
			organizationType.includes(datum.organizationType)
		) {
			const thisAllocationSource = lists.allocationSources[
				datum.allocationSource
			].toLocaleLowerCase() as AllocationSources;

			dataTopFigures.totalAllocations += datum.budget;
			dataTopFigures[`${thisAllocationSource}Total`] += datum.budget;

			let foundFund = dataFunds.find(
				fundDatum => fundDatum.fund === datum.fund
			);

			if (!foundFund) {
				foundFund = {
					fund: datum.fund,
					totalAllocations: 0,
					cvaAllocations: 0,
					standardTotalAllocations: 0,
					reserveTotalAllocations: 0,
					standardCvaAllocations: 0,
					reserveCvaAllocations: 0,
					cvaPercentage: 0,
				};
				dataFunds.push(foundFund);
			}

			foundFund.totalAllocations += datum.budget;
			foundFund[`${thisAllocationSource}TotalAllocations`] +=
				datum.budget;

			if (datum.cvaData !== null && cvaBudget) {
				dataTopFigures.allocations += cvaBudget;
				dataTopFigures.projects.add(datum.projectId);
				if (datum.organizationId) {
					dataTopFigures.partners.add(datum.organizationId);
				}
				dataTopFigures[thisAllocationSource] += cvaBudget;
				foundFund.cvaAllocations += cvaBudget;
				foundFund[`${thisAllocationSource}CvaAllocations`] += cvaBudget;

				if (fund.includes(datum.fund)) {
					datum.cvaData.forEach(cva => {
						let foundType = dataTypes.find(
							type => type.cvaType === cva.cvaId
						);

						if (!foundType) {
							foundType = {
								cvaType: cva.cvaId,
								allocations: 0,
								standard: 0,
								reserve: 0,
								sectors: [],
							};

							dataTypes.push(foundType);
						}
						foundType.allocations += cva.budget;
						foundType[thisAllocationSource] += cva.budget;

						let foundSector = foundType.sectors.find(
							sector => sector.sector === cva.sectorId
						);
						if (!foundSector) {
							foundSector = {
								sector: cva.sectorId,
								allocations: 0,
								standard: 0,
								reserve: 0,
							};
							foundType.sectors.push(foundSector);
						}
						foundSector.allocations += cva.budget;
						foundSector[thisAllocationSource] += cva.budget;
					});
				}
			}
		}

		if (year.includes(datum.year) && fund.includes(datum.fund)) {
			inSelectionData.organizationTypes.add(datum.organizationType);
		}
		if (
			organizationType.includes(datum.organizationType) &&
			fund.includes(datum.fund)
		) {
			inSelectionData.years.add(datum.year);
		}
		if (
			year.includes(datum.year) &&
			organizationType.includes(datum.organizationType)
		) {
			inSelectionData.funds.add(datum.fund);
		}
	});

	dataFunds.forEach(fundDatum => {
		fundDatum.cvaPercentage =
			fundDatum.cvaAllocations > 0
				? (fundDatum.cvaAllocations / fundDatum.totalAllocations) * 100
				: 0;
	});

	dataTypes.sort((a, b) => b.allocations - a.allocations);
	dataFunds.sort((a, b) => b.totalAllocations - a.totalAllocations);

	timelineData.forEach(yearDatum => {
		yearDatum.cvaPercentage =
			yearDatum.total > 0 ? (yearDatum.cva / yearDatum.total) * 100 : 0;

		fundsInTimeline.forEach(fundId => {
			yearDatum[`${fundId}CvaPercentage`] =
				yearDatum[`${fundId}Total`] > 0
					? (yearDatum[`${fundId}Cva`] /
							yearDatum[`${fundId}Total`]) *
					  100
					: 0;
		});
	});

	timelineData.sort((a, b) => a.year - b.year);

	return {
		dataTopFigures,
		dataCvaTypes: dataTypes,
		dataFunds,
		timelineData,
		inSelectionData,
	};
}

export default processData;
