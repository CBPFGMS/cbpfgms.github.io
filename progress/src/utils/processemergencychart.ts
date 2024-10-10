import { DatumEmergency } from "../utils/processdatasummary";
import { EmergencyChartModes } from "../components/EmergencyChart";
import { OverviewDatum, TimelineDatum } from "../charts/createemergency";
import { sum, timeFormat } from "d3";
import constants from "../utils/constants";

export type Month = (typeof monthsArray)[number];

const { monthsArray } = constants;

const formatMonth = timeFormat("%b");

function processOverviewData(
	dataEmergency: DatumEmergency[],
	mode: EmergencyChartModes
): OverviewDatum[] {
	const data: OverviewDatum[] = dataEmergency.reduce((acc, curr) => {
		const groupId = mode === "aggregated" ? null : curr.emergencyGroup;
		const valueId =
			mode === "aggregated" ? curr.emergencyGroup : curr.emergencyType;

		let group = acc.find(d => d.group === groupId);

		if (!group) {
			group = { group: groupId, values: [] };
			acc.push(group);
		}

		let value = group.values.find(d => d.id === valueId);

		if (!value) {
			value = { id: valueId, value: 0 };
			group.values.push(value);
		}

		value.value += curr.allocations;

		return acc;
	}, [] as OverviewDatum[]);

	data.forEach(group => group.values.sort((a, b) => b.value - a.value));
	if (data.length > 1) {
		data.sort(
			(a, b) => sum(b.values, d => d.value) - sum(a.values, d => d.value)
		);
	}

	return data;
}

function processTimelineData(
	dataEmergency: DatumEmergency[],
	mode: EmergencyChartModes
): TimelineDatum[] {
	const data: TimelineDatum[] = dataEmergency.reduce((acc, curr) => {
		const groupId = mode === "aggregated" ? null : curr.emergencyGroup;
		const valueId =
			mode === "aggregated" ? curr.emergencyGroup : curr.emergencyType;

		let group = acc.find(d => d.group === groupId);

		if (!group) {
			group = { group: groupId, values: [] };
			acc.push(group);
		}

		let value = group.values.find(d => d.id === valueId);

		if (!value) {
			value = {
				id: valueId,
				values: monthsArray.map(d => ({ value: 0, month: d })),
			};
			group.values.push(value);
		}

		let monthValue = value.values.find(
			d => d.month === formatMonth(curr.date)
		);

		if (!monthValue) {
			monthValue = { month: formatMonth(curr.date) as Month, value: 0 };
			value.values.push(monthValue);
		}

		monthValue.value += curr.allocations;

		return acc;
	}, [] as TimelineDatum[]);

	// data.forEach(group =>
	// 	group.values.forEach(d =>
	// 		d.values.sort(
	// 			(a, b) =>
	// 				monthsArray.indexOf(a.month) - monthsArray.indexOf(b.month)
	// 		)
	// 	)
	// );

	if (data.length > 1) {
		data.sort(
			(a, b) =>
				sum(b.values, d => sum(d.values, e => e.value)) -
				sum(a.values, d => sum(d.values, e => e.value))
		);
	}

	return data;
}

export { processOverviewData, processTimelineData };
