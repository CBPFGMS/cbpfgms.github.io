import type { AllocationsData } from "./processrawdata";
import { constants } from "./constants";

type ProcessDataSectorsParams = {
	allocationsData: AllocationsData;
	funds: number[];
	year: number;
	setSector: React.Dispatch<React.SetStateAction<number[]>>;
	globalAttribution: number;
	hasUS: boolean;
};

export type SectorsData = {
	total: number;
	sectors: {
		sector: number;
		budget: number;
		percentage: number;
	}[];
};

const { USProjectsString } = constants;

function processDataSectors({
	allocationsData,
	funds,
	year,
	setSector,
	globalAttribution,
	hasUS,
}: ProcessDataSectorsParams): SectorsData {
	const sectorsData: SectorsData = {
		total: 0,
		sectors: [],
	};

	allocationsData.forEach(datum => {
		if (!hasUS && datum.projectCode.includes(USProjectsString)) {
			return;
		}
		if (funds.includes(datum.fund) && year === datum.year) {
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
