import type { AllocationsData } from "./processrawdata";

type ProcessDataSectorsParams = {
	allocationsData: AllocationsData;
	funds: number[];
	setSector: React.Dispatch<React.SetStateAction<number[]>>;
	globalAttribution: number;
};

export type SectorsData = {
	total: number;
	sectors: {
		sector: number;
		budget: number;
		percentage: number;
	}[];
};

function processDataSectors({
	allocationsData,
	funds,
	setSector,
	globalAttribution,
}: ProcessDataSectorsParams): SectorsData {
	const sectorsData: SectorsData = {
		total: 0,
		sectors: [],
	};

	allocationsData.forEach(datum => {
		if (funds.includes(datum.fund)) {
			sectorsData.total += datum.budget * globalAttribution;

			datum.sectorData.forEach(sectorDatum => {
				const sectorAttributedBudget =
					sectorDatum.budget * globalAttribution;

				const foundSector = sectorsData.sectors.find(
					d => d.sector === sectorDatum.sectorId,
				);

				if (foundSector) {
					foundSector.budget += sectorAttributedBudget;
				} else {
					sectorsData.sectors.push({
						sector: sectorDatum.sectorId,
						budget: sectorAttributedBudget,
						percentage: 0,
					});
				}
			});
		}
	});

	sectorsData.sectors.forEach(sector => {
		sector.percentage = sector.budget / sectorsData.total;
	});

	sectorsData.sectors.sort((a, b) => b.percentage - a.percentage);

	setSector(sectorsData.sectors.map(d => d.sector));

	return sectorsData;
}

export default processDataSectors;
