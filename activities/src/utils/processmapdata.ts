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
}: MapDataParams): MapDatum[] {
	const mapData: MapDatum[] = [];

	data.forEach(datum => {
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
			foundLocation.activities.push({
				activity: datum.activity,
				sector: datum.sector,
			});
		}
	});

	return mapData;
}

export default processMapData;
