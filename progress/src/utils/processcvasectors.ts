import { CvaChartModes, CvaChartTypes } from "../components/CvaChart";
import { DatumCva } from "./processdatasummary";

export type CvaSector = {
	sector: number;
	value: number;
};

function processCvaSectors(
	data: DatumCva[],
	cvaChartType: CvaChartTypes,
	cvaChartMode: CvaChartModes
): CvaSector[] {
	const sectors: CvaSector[] = [];

	const property =
		cvaChartMode === "allocations"
			? "targetedAllocations"
			: "targetedPeople";

	data.forEach(datum => {
		if (cvaChartType.includes(datum.cvaType)) {
			const foundSector = sectors.find(s => s.sector === datum.sector);
			if (foundSector) {
				foundSector.value += datum[property];
			} else {
				sectors.push({ sector: datum.sector, value: datum[property] });
			}
		}
	});

	sectors.sort((a, b) => b.value - a.value);

	return sectors;
}

export default processCvaSectors;
