import type { Statuses } from "../components/MainContainer";
import type { Data } from "./processrawdata";

type ProcessDataSectorsParams = {
	data: Data;
	fund: number[];
	status: Statuses[];
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
	data,
	fund,
	status,
}: ProcessDataSectorsParams): SectorsData {
	const sectorsData: SectorsData = {
		total: 0,
		sectors: [],
	};

	data.forEach(datum => {
		if (fund.includes(datum.fund) && status.includes(datum.projectStatus)) {
			sectorsData.total += datum.budget;

			datum.sectorData.forEach(sectorDatum => {
				const foundSector = sectorsData.sectors.find(
					d => d.sector === sectorDatum.sectorId,
				);

				if (foundSector) {
					foundSector.budget += sectorDatum.budget;
				} else {
					sectorsData.sectors.push({
						sector: sectorDatum.sectorId,
						budget: sectorDatum.budget,
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

	return sectorsData;
}

export default processDataSectors;
