import { type Data } from "./processrawdata";
import { type List } from "./makelists";
import constants from "./constants";

type ProcessDataSummaryParams = {
	data: Data;
	yearSummary: number[];
	countrySummary: number[];
	allocationSourceSummary: number[];
	lists: List;
};

export type DataTopFigures = {
	totalAllocations: number;
	allocations: number;
	projects: Set<number>;
	partners: Set<number>;
	rr: number;
	ufe: number;
};

export type DatumTypes = {
	cvaType: number;
	allocations: number;
	percentage: number;
	rr: number;
	ufe: number;
};

export type DatumSectors = {
	sector: number;
	allocations: number;
	rr: number;
	ufe: number;
};

export type DatumAgencies = {
	agency: number;
	allocations: number;
	rr: number;
	ufe: number;
};

export type InSelectionDataSummary = {
	yearsSummary: Set<number>;
	allocationSourcesSummary: Set<number>;
	countriesSummary: Set<number>;
};

export type AllocationWindows = (typeof constants.allocationWindows)[number];

function processDataSummary({
	data,
	yearSummary,
	countrySummary,
	allocationSourceSummary,
	lists,
}: ProcessDataSummaryParams): {
	dataTopFigures: DataTopFigures;
	dataTypes: DatumTypes[];
	dataSectors: DatumSectors[];
	dataAgencies: DatumAgencies[];
	inSelectionDataSummary: InSelectionDataSummary;
} {
	const inSelectionDataSummary: InSelectionDataSummary = {
		yearsSummary: new Set<number>(),
		allocationSourcesSummary: new Set<number>(),
		countriesSummary: new Set<number>(),
	};

	const dataTopFigures: DataTopFigures = {
		totalAllocations: 0,
		allocations: 0,
		projects: new Set<number>(),
		partners: new Set<number>(),
		rr: 0,
		ufe: 0,
	};

	const dataTypes: DatumTypes[] = [];
	const dataSectors: DatumSectors[] = [];
	const dataAgencies: DatumAgencies[] = [];

	data.forEach(datum => {
		if (
			yearSummary.includes(datum.year) &&
			countrySummary.includes(datum.fund) &&
			allocationSourceSummary.includes(datum.allocationSource)
		) {
			dataTopFigures.totalAllocations += datum.budget;
			if (datum.cvaData !== null) {
				const cvaBudget = datum.cvaData?.reduce(
					(acc, curr) => acc + curr.budget,
					0
				);
				dataTopFigures.allocations += cvaBudget;
				dataTopFigures.projects.add(datum.projectId);
				dataTopFigures.partners.add(datum.organizationId);
				const allocationSource = lists.allocationSourcesAbbreviated[
					datum.allocationSource
				].toLocaleLowerCase() as AllocationWindows;
				dataTopFigures[allocationSource] += cvaBudget;

				const thisOrganization =
					lists.organizationsCompleteList[datum.organizationId]
						.GlobalOrgId;

				const thisAllocationSourceAbbreviation =
					lists.allocationSourcesAbbreviated[
						datum.allocationSource
					].toLocaleLowerCase() as AllocationWindows;

				datum.cvaData.forEach(cva => {
					const foundType = dataTypes.find(
						type => type.cvaType === cva.cvaId
					);

					const foundSector = dataSectors.find(
						sector => sector.sector === cva.sectorId
					);

					const foundAgency = dataAgencies.find(
						agency => agency.agency === thisOrganization
					);

					if (!foundType) {
						const newType: DatumTypes = {
							cvaType: cva.cvaId,
							allocations: cva.budget,
							percentage: 0,
							rr: 0,
							ufe: 0,
						};
						newType[thisAllocationSourceAbbreviation] = cva.budget;
						dataTypes.push(newType);
					} else {
						foundType.allocations += cva.budget;
						foundType[thisAllocationSourceAbbreviation] +=
							cva.budget;
					}

					if (!foundSector) {
						const newSector: DatumSectors = {
							sector: cva.sectorId,
							allocations: cva.budget,
							rr: 0,
							ufe: 0,
						};
						newSector[thisAllocationSourceAbbreviation] =
							cva.budget;
						dataSectors.push(newSector);
					} else {
						foundSector.allocations += cva.budget;
						foundSector[thisAllocationSourceAbbreviation] +=
							cva.budget;
					}
					if (!foundAgency) {
						const newAgency: DatumAgencies = {
							agency: thisOrganization,
							allocations: cva.budget,
							rr: 0,
							ufe: 0,
						};
						newAgency[thisAllocationSourceAbbreviation] =
							cva.budget;
						dataAgencies.push(newAgency);
					} else {
						foundAgency.allocations += cva.budget;
						foundAgency[thisAllocationSourceAbbreviation] +=
							cva.budget;
					}
				});
			}
		}

		if (
			yearSummary.includes(datum.year) &&
			countrySummary.includes(datum.fund)
		) {
			inSelectionDataSummary.allocationSourcesSummary.add(
				datum.allocationSource
			);
		}
		if (
			yearSummary.includes(datum.year) &&
			allocationSourceSummary.includes(datum.allocationSource)
		) {
			inSelectionDataSummary.countriesSummary.add(datum.fund);
		}
		if (
			countrySummary.includes(datum.fund) &&
			allocationSourceSummary.includes(datum.allocationSource)
		) {
			inSelectionDataSummary.yearsSummary.add(datum.year);
		}
	});

	dataTypes.forEach(type => {
		type.percentage = (type.allocations / dataTopFigures.allocations) * 100;
	});

	dataTypes.sort((a, b) => b.allocations - a.allocations);
	dataSectors.sort((a, b) => b.allocations - a.allocations);
	dataAgencies.sort((a, b) => b.allocations - a.allocations);

	return {
		dataTopFigures,
		dataTypes,
		dataSectors,
		dataAgencies,
		inSelectionDataSummary,
	};
}

export default processDataSummary;
