import { DatumEmergency } from "../utils/processdatasummary";
import { EmergencyChartModes } from "../components/EmergencyChart";
import { sum } from "d3";

export type OverviewDatum = {
	group: number;
	groupData: GroupDatum[];
};

export type GroupDatum = {
	id: number;
	values: GroupValuesDatum[];
	parentGroup: number;
};

export type GroupValuesDatum = {
	year: number;
	value: number;
	overLimit: boolean;
};

function processOverviewData(
	dataEmergency: DatumEmergency[],
	mode: EmergencyChartModes
): OverviewDatum[] {
	const data: OverviewDatum[] = dataEmergency.reduce((acc, curr) => {
		const groupId = curr.emergencyGroup,
			groupDatumId =
				mode === "aggregated"
					? curr.emergencyGroup
					: curr.emergencyType,
			year = curr.date.getFullYear();

		let group = acc.find(d => d.group === groupId);

		if (!group) {
			group = { group: groupId, groupData: [] };
			acc.push(group);
		}

		let groupDatum = group.groupData.find(d => d.id === groupDatumId);

		if (!groupDatum) {
			groupDatum = { id: groupDatumId, values: [], parentGroup: groupId };
			group.groupData.push(groupDatum);
		}

		let groupYear = groupDatum.values.find(d => d.year === year);

		if (!groupYear) {
			groupYear = { year: year, value: 0, overLimit: false };
			groupDatum.values.push(groupYear);
		}

		groupYear.value += curr.allocations;

		return acc;
	}, [] as OverviewDatum[]);

	data.forEach(group =>
		group.groupData.forEach(groupData =>
			groupData.values.sort((a, b) => b.value - a.value)
		)
	);

	data.sort(
		(a, b) =>
			sum(b.groupData, d => sum(d.values, e => e.value)) -
			sum(a.groupData, d => sum(d.values, e => e.value))
	);

	return data;
}

export { processOverviewData };
