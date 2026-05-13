import { extent } from "d3";
import type { MapDatum } from "./processmapdata";
import type { Map as MapType } from "leaflet";

function calculateBounds(
	data: MapDatum[],
): [[number, number], [number, number]] {
	if (data.length === 1) {
		const lat = data[0].latitude;
		const lng = data[0].longitude;
		const buffer = 0.25;
		return [
			[lat - buffer, lng - buffer],
			[lat + buffer, lng + buffer],
		];
	}

	const latitudeExtent = extent(data, d => d.latitude) as [number, number];
	const longitudeExtent = extent(data, d => d.longitude) as [number, number];
	return [
		[latitudeExtent[0], longitudeExtent[0]],
		[latitudeExtent[1], longitudeExtent[1]],
	];
}

function zoomToBounds({
	mapData,
	leafletMap,
	mapPadding,
	maxZoomValue,
}: {
	mapData: MapDatum[];
	leafletMap: MapType;
	mapPadding: number;
	maxZoomValue: number;
}) {
	if (!mapData.length) {
		return;
	}

	const bounds = calculateBounds(mapData);
	leafletMap.fitBounds(bounds, {
		padding: [mapPadding, mapPadding],
		maxZoom: maxZoomValue,
	});
}

export default zoomToBounds;
