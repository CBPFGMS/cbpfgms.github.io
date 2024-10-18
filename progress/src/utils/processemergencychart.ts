import { DatumEmergency } from "../utils/processdatasummary";
import { EmergencyChartModes } from "../components/EmergencyChart";
import {
	OverviewDatum,
	TimelineDatum,
	TimelineDatumValues,
	TimelineEmergencyProperty,
} from "../charts/createemergency";
import { sum, timeFormat, stack, stackOrderDescending } from "d3";
import constants from "../utils/constants";
import { List } from "./makelists";

export type Month = (typeof monthsArray)[number];

type EmergencyTypesPerGroup = {
	[key: number]: number[];
};

const { monthsArray, idString } = constants;

const formatMonth = timeFormat("%b");

const stackGenerator = stack<
	TimelineDatumValues,
	keyof TimelineEmergencyProperty
>().order(stackOrderDescending);
//.order(stackCustomOrder);

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
	mode: EmergencyChartModes,
	lists: List
): TimelineDatum[] {
	const emergenciesInData = new Set<number>();
	const groupsInData = new Set<number>();
	dataEmergency.forEach(d => {
		emergenciesInData.add(d.emergencyType);
		groupsInData.add(d.emergencyGroup);
	});

	const groupsIds = Array.from(groupsInData);
	const emergencyTypesPerGroup: EmergencyTypesPerGroup = groupsIds.reduce(
		(acc, curr) => {
			acc[curr] = Array.from(
				lists.emergencyDetails.emergencyGroups.get(curr)!.emergencyTypes
			).map(Number);
			return acc;
		},
		{} as EmergencyTypesPerGroup
	);

	const data: TimelineDatum[] = dataEmergency.reduce((acc, curr) => {
		const groupId = mode === "aggregated" ? null : curr.emergencyGroup;
		const valueId =
			mode === "aggregated" ? curr.emergencyGroup : curr.emergencyType;
		const thisMonth = formatMonth(curr.date) as Month;

		let group = acc.find(d => d.group === groupId);

		if (!group) {
			const ids = (
				mode === "aggregated"
					? groupsIds
					: emergencyTypesPerGroup[groupId!]
			).reduce((acc, curr) => {
				if (mode === "aggregated" || emergenciesInData.has(curr)) {
					acc[`${idString}${curr}`] = 0;
				}
				return acc;
			}, {} as TimelineEmergencyProperty);
			group = {
				group: groupId,
				values: monthsArray.map(d => ({ total: 0, month: d, ...ids })),
				stackedData: [],
			};
			acc.push(group);
		}

		const month = group.values.find(d => d.month === thisMonth);

		if (month) {
			month.total += curr.allocations;
			month[`${idString}${valueId}`] =
				(month[`${idString}${valueId}`] || 0) + curr.allocations;
		}

		return acc;
	}, [] as TimelineDatum[]);

	if (data.length > 1) {
		data.sort(
			(a, b) => sum(b.values, d => d.total) - sum(a.values, d => d.total)
		);
	}

	data.forEach(group => {
		stackGenerator.keys(
			group.group === null
				? groupsIds.map(
						d =>
							`${idString}${d}` as keyof TimelineEmergencyProperty
				  )
				: (Object.keys(group.values[0]).filter(d =>
						d.includes(idString)
				  ) as (keyof TimelineEmergencyProperty)[])
		);
		group.stackedData = stackGenerator(group.values);
	});

	return data;
}

export { processOverviewData, processTimelineData };
