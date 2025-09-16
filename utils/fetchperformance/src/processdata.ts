import type { Datum } from "./schemas";
import { apiIdsList } from "./apilist";

type TemporaryDatum = {
	[key: number]: {
		downloadTime: number[];
		responseTime: number[];
		numberOfCalls: number;
		size: number[];
	};
};

export type BarChartDatum = {
	id: number;
	averageDownloadTime: number;
	averageResponseTime: number;
	averageFileSize: number;
};

export type LollipopChartDatum = {
	date: Date;
	numberOfErrors: number;
	apisWithErrors: {
		apiId: number;
		error: string;
	}[];
};

export type LineChartDatum = {
	date: Date;
	[key: number]: number | null;
};

export function processData(rawData: Datum[]): {
	barChartData: BarChartDatum[];
	lollipopChartData: LollipopChartDatum[];
	lineChartData: LineChartDatum[];
	minimumDate: Date;
	maximumDate: Date;
	maxNumberOfCalls: number;
} {
	const tempData: TemporaryDatum = {};
	const barChartData: BarChartDatum[] = [];
	const lineChartData: LineChartDatum[] = [];
	const lollipopChartData: LollipopChartDatum[] = [];
	let minimumDate: Date = rawData[0].date;
	let maximumDate: Date = rawData[0].date;

	apiIdsList.forEach(id => {
		tempData[id] = {
			downloadTime: [],
			responseTime: [],
			size: [],
			numberOfCalls: 0,
		};
		barChartData.push({
			id,
			averageDownloadTime: 0,
			averageResponseTime: 0,
			averageFileSize: 0,
		});
	});

	rawData.forEach(datum => {
		minimumDate = datum.date < minimumDate ? datum.date : minimumDate;
		maximumDate = datum.date > maximumDate ? datum.date : maximumDate;

		const lineDatum = lineChartData.find(
			l =>
				l.date.getFullYear() === datum.date.getFullYear() &&
				l.date.getMonth() === datum.date.getMonth() &&
				l.date.getDate() === datum.date.getDate()
		);
		if (lineDatum) {
			if (
				datum.dataReceived &&
				datum.downloadTime !== null &&
				datum.responseTime !== null
			) {
				lineDatum[datum.id] = datum.downloadTime + datum.responseTime;
			} else {
				lineDatum[datum.id] = null;
			}
		} else {
			const newLineDatum: LineChartDatum = {
				date: new Date(
					datum.date.getFullYear(),
					datum.date.getMonth(),
					datum.date.getDate()
				),
			};
			apiIdsList.forEach(id => {
				newLineDatum[id] = 0;
			});
			if (
				datum.dataReceived &&
				datum.downloadTime !== null &&
				datum.responseTime !== null
			) {
				newLineDatum[datum.id] =
					datum.downloadTime + datum.responseTime;
			} else {
				newLineDatum[datum.id] = null;
			}
			lineChartData.push(newLineDatum);
		}

		if (!datum.dataReceived) {
			const lollipopDatum = lollipopChartData.find(
				l =>
					l.date.getFullYear() === datum.date.getFullYear() &&
					l.date.getMonth() === datum.date.getMonth() &&
					l.date.getDate() === datum.date.getDate()
			);
			if (lollipopDatum) {
				lollipopDatum.numberOfErrors += 1;
				lollipopDatum.apisWithErrors.push({
					apiId: datum.id,
					error: datum.error ?? "Unknown error",
				});
			} else {
				lollipopChartData.push({
					date: new Date(
						datum.date.getFullYear(),
						datum.date.getMonth(),
						datum.date.getDate()
					),
					numberOfErrors: 1,
					apisWithErrors: [
						{
							apiId: datum.id,
							error: datum.error ?? "Unknown error",
						},
					],
				});
			}
			return;
		}
		if (
			datum.downloadTime === null ||
			datum.responseTime === null ||
			datum.contentSize === null
		)
			return;
		tempData[datum.id].downloadTime.push(datum.downloadTime);
		tempData[datum.id].responseTime.push(datum.responseTime);
		tempData[datum.id].size.push(datum.contentSize);
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
		d.averageFileSize =
			tempDatum.size.reduce((a, b) => a + b, 0) / tempDatum.numberOfCalls;
	});

	return {
		barChartData,
		lollipopChartData,
		lineChartData,
		minimumDate,
		maximumDate,
		maxNumberOfCalls,
	};
}
