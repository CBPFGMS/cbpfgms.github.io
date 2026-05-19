import type { InSelectionData } from "./filterData";
import type { Data } from "./processrawdata";

type MapDataParams = {
	data: Data;
	selectedFunds: number[];
	selectedStatuses: number[];
	selectedPartners: number[];
	selectedAdminLevels: number[];
};

export type MapDatum = {
	latitude: number;
	longitude: number;
	name: string;
	locationLevel: number;
	locationName: string;
	parentLocationName: string | null;
	activities: { activity: number; sector: number }[];
	fund: number;
	year: number;
};

function processMapData({
	data,
	selectedFunds,
	selectedStatuses,
	selectedPartners,
	selectedAdminLevels,
}: MapDataParams): { mapData: MapDatum[]; inFiltersData: InSelectionData } {
	const mapData: MapDatum[] = [];

	const inFiltersData: InSelectionData = {
		funds: new Set<number>(),
		statuses: new Set<number>(),
		partners: new Set<number>(),
		adminLevels: new Set<number>(),
	};

	data.forEach(datum => {
		if (
			selectedFunds.includes(datum.fund) &&
			selectedStatuses.includes(datum.projectStatus) &&
			selectedPartners.includes(datum.organizationType)
		) {
			inFiltersData.adminLevels.add(datum.locationLevel);
		}

		if (
			selectedStatuses.includes(datum.projectStatus) &&
			selectedPartners.includes(datum.organizationType) &&
			selectedAdminLevels.includes(datum.locationLevel)
		) {
			inFiltersData.funds.add(datum.fund);
		}

		if (
			selectedFunds.includes(datum.fund) &&
			selectedPartners.includes(datum.organizationType) &&
			selectedAdminLevels.includes(datum.locationLevel)
		) {
			inFiltersData.statuses.add(datum.projectStatus);
		}

		if (
			selectedFunds.includes(datum.fund) &&
			selectedStatuses.includes(datum.projectStatus) &&
			selectedAdminLevels.includes(datum.locationLevel)
		) {
			inFiltersData.partners.add(datum.organizationType);
		}

		if (
			!selectedFunds.includes(datum.fund) ||
			!selectedStatuses.includes(datum.projectStatus) ||
			!selectedPartners.includes(datum.organizationType) ||
			!selectedAdminLevels.includes(datum.locationLevel)
		) {
			return;
		}

		const foundLocation = mapData.find(
			mapDatum =>
				mapDatum.locationName === datum.locationName &&
				mapDatum.latitude === datum.latitude &&
				mapDatum.longitude === datum.longitude,
		);

		if (!foundLocation) {
			mapData.push({
				latitude: datum.latitude,
				longitude: datum.longitude,
				name: datum.locationName,
				locationLevel: datum.locationLevel,
				locationName: datum.locationName,
				parentLocationName: datum.parentLocationName,
				activities: [
					{
						activity: datum.activity,
						sector: datum.sector,
					},
				],
				fund: datum.fund,
				year: datum.year,
			});
		} else {
			const foundActivityAndSector = foundLocation.activities.find(
				d => d.activity === datum.activity && d.sector === datum.sector,
			);

			if (foundActivityAndSector) {
				return;
			}

			foundLocation.activities.push({
				activity: datum.activity,
				sector: datum.sector,
			});
		}
	});

	return { mapData, inFiltersData };
}

export default processMapData;
