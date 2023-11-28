import { sum } from "d3-array";
import { ProcessDataMap, MapData } from "../types";

const processDataMap: ProcessDataMap = ({
	rawData,
	reportYear,
	year,
	fund,
	allocationSource,
	allocationType,
	locationsList,
}) => {
	const data: MapData[] = [];

	const locationsNotFound = new Set<number>();

	const thisYear = rawData.byLocation.find(
		year => year.year === reportYear[0] //Change this logic in case of multiyears
	);

	thisYear?.values.forEach(value => {
		if (
			fund.includes(value.PooledFundId) &&
			allocationSource.includes(value.AllocationSourceId) &&
			allocationType.includes(value.AllocationtypeId) &&
			(year === null || year.includes(value.AllocationYear))
		) {
			const foundLocation = data.find(
				d =>
					d.coordinates[0] ===
						locationsList[value.LocationID]?.coordinates[0] &&
					d.coordinates[1] ===
						locationsList[value.LocationID]?.coordinates[1]
			);

			if (foundLocation) {
				foundLocation.beneficiaries.reachedBoys +=
					value.ReachedBoys || 0;
				foundLocation.beneficiaries.reachedGirls +=
					value.ReachedGirls || 0;
				foundLocation.beneficiaries.reachedMen += value.ReachedMen || 0;
				foundLocation.beneficiaries.reachedWomen +=
					value.ReachedWomen || 0;
				foundLocation.beneficiaries.targetedBoys +=
					value.TargetBoys || 0;
				foundLocation.beneficiaries.targetedGirls +=
					value.TargetGirls || 0;
				foundLocation.beneficiaries.targetedMen += value.TargetMen || 0;
				foundLocation.beneficiaries.targetedWomen +=
					value.TargetWomen || 0;
			} else {
				if (!locationsList[value.LocationID]) {
					locationsNotFound.add(value.LocationID);
				}
				if (locationsList[value.LocationID]) {
					data.push({
						locationId: value.LocationID,
						locationName:
							locationsList[value.LocationID]?.locationName,
						coordinates:
							locationsList[value.LocationID]?.coordinates,
						beneficiaries: {
							reachedBoys: value.ReachedBoys || 0,
							reachedGirls: value.ReachedGirls || 0,
							reachedMen: value.ReachedMen || 0,
							reachedWomen: value.ReachedWomen || 0,
							targetedBoys: value.TargetBoys || 0,
							targetedGirls: value.TargetGirls || 0,
							targetedMen: value.TargetMen || 0,
							targetedWomen: value.TargetWomen || 0,
						},
					});
				}
			}
		}
	});

	if (locationsNotFound.size > 0) {
		console.warn(
			"Locations not found in locationsList: " +
				JSON.stringify(Array.from(locationsNotFound))
		);
	}

	data.sort(
		(a, b) =>
			sum(Object.values(b.beneficiaries)) -
			sum(Object.values(a.beneficiaries))
	);

	return data;
};

export default processDataMap;
