import type { Datum } from "./schemas";
import { apiList, apiIdsList } from "./apilist";

type TemporaryDatum = {
	[key: number]: {
		downloadTime: number[];
		responseTime: number[];
		numberOfCalls: number;
	};
};

export type BarChartDatum = {
	id: number;
	averageDownloadTime: number;
	averageResponseTime: number;
};

export function processData(rawData: Datum[]): {
	barChartData: BarChartDatum[];
	minimumDate: Date;
	maximumDate: Date;
	maxNumberOfCalls: number;
} {
	const tempData: TemporaryDatum = {};
	const barChartData: BarChartDatum[] = [];
	let minimumDate: Date = rawData[0].date;
	let maximumDate: Date = rawData[0].date;

	apiIdsList.forEach(id => {
		tempData[id] = {
			downloadTime: [],
			responseTime: [],
			numberOfCalls: 0,
		};
		barChartData.push({
			id,
			averageDownloadTime: 0,
			averageResponseTime: 0,
		});
	});

	rawData.forEach(datum => {
		minimumDate = datum.date < minimumDate ? datum.date : minimumDate;
		maximumDate = datum.date > maximumDate ? datum.date : maximumDate;
		if (datum.downloadTime === null || datum.responseTime === null) return;
		tempData[datum.id].downloadTime.push(datum.downloadTime);
		tempData[datum.id].responseTime.push(datum.responseTime);
		tempData[datum.id].numberOfCalls += 1;
	});

	let maxNumberOfCalls = 0;

	Object.keys(tempData).forEach(key => {
		maxNumberOfCalls = Math.max(
			maxNumberOfCalls,
			tempData[parseInt(key)].numberOfCalls
		);
	});

	barChartData.forEach(d => {
		const tempDatum = tempData[d.id];
		if (tempDatum.numberOfCalls === 0) return;
		d.averageDownloadTime =
			tempDatum.downloadTime.reduce((a, b) => a + b, 0) /
			tempDatum.numberOfCalls;
		d.averageResponseTime =
			tempDatum.responseTime.reduce((a, b) => a + b, 0) /
			tempDatum.numberOfCalls;
	});

	return { barChartData, minimumDate, maximumDate, maxNumberOfCalls };
}
