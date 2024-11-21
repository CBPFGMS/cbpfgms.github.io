import { DatumEmergency } from "./processdatasummary";
import { EmergencyChartModes } from "../components/EmergencyChart";
import { sum, timeFormat, stack, stackOrderDescending, Series } from "d3";
import constants from "./constants";
import { List } from "./makelists";
import { stackCustomOrder } from "../charts/emergencyutils";

export type TimelineDatum = {
	group: null | number;
	yearsData: TimelineYearValues[];
};

export type TimelineYearValues = {
	year: number;
	parentGroup: null | number;
	values: TimelineDatumValues[];
	stackedData: StackedDatum[];
};

export type TimelineEmergencyProperty = {
	[key: number]: number;
};

export type TimelineDatumValues = {
	month: Month;
	total: number;
} & TimelineEmergencyProperty;

export type StackedDatum = Series<
	TimelineDatumValues,
	keyof TimelineEmergencyProperty
>;

export type Month = (typeof monthsArray)[number];

type EmergencyTypesPerGroup = {
	[key: number]: number[];
};

const { monthsArray } = constants;

const formatMonth = timeFormat("%b");

const stackGenerator = stack<
	TimelineDatumValues,
	keyof TimelineEmergencyProperty
>();

function processTimelineData(
	dataEmergency: DatumEmergency[],
	mode: EmergencyChartModes,
	lists: List,
	baselineGroup?: keyof TimelineEmergencyProperty
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
		const thisYear = curr.date.getFullYear();

		let group = acc.find(d => d.group === groupId);

		if (!group) {
			group = {
				group: groupId,
				yearsData: [],
			};
			acc.push(group);
		}

		let yearsData = group.yearsData.find(d => d.year === thisYear);

		if (!yearsData) {
			const ids = (
				mode === "aggregated"
					? groupsIds
					: emergencyTypesPerGroup[groupId!]
			).reduce((acc, curr) => {
				if (mode === "aggregated" || emergenciesInData.has(curr)) {
					acc[curr] = 0;
				}
				return acc;
			}, {} as TimelineEmergencyProperty);
			const values = monthsArray.map(d => ({
				total: 0,
				month: d,
				...ids,
			}));
			yearsData = {
				year: thisYear,
				parentGroup: groupId,
				values,
				stackedData: [],
			};
			group.yearsData.push(yearsData);
		}

		const month = yearsData.values.find(d => d.month === thisMonth);

		if (month) {
			month.total += curr.allocations;
			month[valueId] = (month[valueId] || 0) + curr.allocations;
		}

		return acc;
	}, [] as TimelineDatum[]);

	if (data.length > 1) {
		data.sort(
			(a, b) =>
				sum(b.yearsData, e => sum(e.values, f => f.total)) -
				sum(a.yearsData, e => sum(e.values, f => f.total))
		);
	}

	data.forEach(group => {
		group.yearsData.sort((a, b) => b.year - a.year);
	});

	data.forEach(group => {
		group.yearsData.forEach(yearDatum => {
			stackGenerator
				.keys(
					yearDatum.parentGroup === null
						? groupsIds
						: Object.keys(group.yearsData[0].values[0]).map(d => +d)
				)
				.order(
					baselineGroup
						? d =>
								stackCustomOrder(
									d as unknown as Series<
										TimelineDatumValues,
										keyof TimelineEmergencyProperty
									>[],
									baselineGroup
								)
						: stackOrderDescending
				);
			yearDatum.stackedData = stackGenerator(yearDatum.values);
		});
	});

	return data;
}

export { processTimelineData };
