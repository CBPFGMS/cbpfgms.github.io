import { SVGOverlay, useMap } from "react-leaflet";
import { useRef, useEffect } from "react";
import createMap from "../charts/createmap";
import { extent } from "d3-array";
import { SVGOverlayComponentProps, MapData } from "../types";

function SVGOverlayComponent({
	data,
	maxZoomValue,
	maxValue,
	maxCircleRadius,
	minCircleRadius,
}: SVGOverlayComponentProps) {
	const map = useMap();
	const svgGroupRef = useRef<SVGSVGElement | null>(null);

	useEffect(() => {
		const bounds = calculateBounds(data);
		map.flyToBounds(bounds, {
			paddingTopLeft: [maxCircleRadius, maxCircleRadius],
			paddingBottomRight: [maxCircleRadius, maxCircleRadius],
			maxZoom: maxZoomValue,
		});
		if (svgGroupRef.current) {
			createMap({
				data,
				svgGroupRef,
				maxCircleRadius,
				maxValue,
				minCircleRadius,
			});
		}
	}, [data, map, maxCircleRadius, maxValue, maxZoomValue, minCircleRadius]);

	return (
		<SVGOverlay
			bounds={[
				[90, -180],
				[-90, 180],
			]}
			opacity={1}
		>
			<g ref={svgGroupRef} />
		</SVGOverlay>
	);
}

function calculateBounds(
	data: MapData[]
): [[number, number], [number, number]] {
	if (data.length === 1) {
		const lat = data[0].coordinates[0];
		const lng = data[0].coordinates[1];
		const buffer = 0.25; 
		return [
			[lat - buffer, lng - buffer],
			[lat + buffer, lng + buffer],
		];
	}

	const latitudeExtent = extent(data, d => d.coordinates[0]) as [
		number,
		number
	];
	const longitudeExtent = extent(data, d => d.coordinates[1]) as [
		number,
		number
	];
	return [
		[latitudeExtent[0], longitudeExtent[0]],
		[latitudeExtent[1], longitudeExtent[1]],
	];
}

export default SVGOverlayComponent;
