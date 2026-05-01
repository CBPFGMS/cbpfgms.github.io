import type { Data } from "./processrawdata";

export type InSelectionData = {
	funds: Set<number>;
	statuses: Set<number>;
	partners: Set<number>;
	adminLevels: Set<number>;
};

type FilterDataParams = {
	data: Data;
	sectors: number[];
	activities: number[];
};

function filterData({ data, sectors, activities }: FilterDataParams): {
	filteredData: Data;
	inSelectionData: InSelectionData;
} {
	const inSelectionData: InSelectionData = {
		funds: new Set(),
		statuses: new Set(),
		partners: new Set(),
		adminLevels: new Set(),
	};

	const sectorSet = new Set(sectors);
	const activitySet = new Set(activities);

	const hasSectors = sectorSet.size > 0;
	const hasActivities = activitySet.size > 0;

	const filteredData = data.filter(datum => {
		const matchesSector = !hasSectors || sectorSet.has(datum.sector);
		const matchesActivity =
			!hasActivities || activitySet.has(datum.activity);

		if (matchesSector && matchesActivity) {
			inSelectionData.funds.add(datum.fund);
			inSelectionData.statuses.add(datum.projectStatus);
			inSelectionData.partners.add(datum.organizationType);
			inSelectionData.adminLevels.add(datum.locationLevel);
		}

		return matchesSector && matchesActivity;
	});

	return { filteredData, inSelectionData };
}

export default filterData;
