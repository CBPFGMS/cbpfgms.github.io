import type { Tranche } from "../components/MainContainer";
import type { Data, InDataLists } from "./processrawdata";

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
	tranche: Tranche;
	inDataLists: InDataLists;
};

function filterData({
	data,
	sectors,
	activities,
	tranche,
	inDataLists,
}: FilterDataParams): {
	filteredData: Data;
	inSelectionData: InSelectionData;
} {
	const inSelectionData: InSelectionData = {
		funds: new Set(),
		statuses: new Set(),
		partners: new Set(),
		adminLevels: new Set(),
	};

	if (sectors.length === 0 || activities.length === 0) {
		return {
			filteredData: [],
			inSelectionData,
		};
	}

	const sectorSet = new Set(sectors);
	const activitySet = new Set(activities);

	const hasSectors = sectorSet.size > 0;
	const hasActivities = activitySet.size > 0;

	const filteredData = data.filter(datum => {
		if (
			tranche !== "all" &&
			!inDataLists.projectsPerTranche[tranche]?.has(datum.projectCode)
		) {
			return;
		}

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
