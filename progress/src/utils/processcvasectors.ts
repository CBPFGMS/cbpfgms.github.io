import { CvaChartModes, CvaChartTypes } from "../components/CvaChart";
import { DatumCva } from "./processdatasummary";

export type CvaSector = {
	sector: number;
	targeted: number;
	reached: number;
};

function processCvaSectors(
	data: DatumCva[],
	cvaChartType: CvaChartTypes,
	cvaChartMode: CvaChartModes
): CvaSector[] {
	const sectors: CvaSector[] = [];

	const property = cvaChartMode === "allocations" ? "Allocations" : "People";

	data.forEach(datum => {
		if (cvaChartType.includes(datum.cvaType)) {
			const foundSector = sectors.find(s => s.sector === datum.sector);
			if (foundSector) {
				foundSector.targeted += datum[`targeted${property}`];
				foundSector.reached += datum[`reached${property}`];
			} else {
				sectors.push({
					sector: datum.sector,
					targeted: datum[`targeted${property}`],
					reached: datum[`reached${property}`],
				});
			}
		}
	});

	sectors.sort((a, b) => b.targeted + b.reached - (a.targeted + a.reached));

	return sectors;
}

export default processCvaSectors;
