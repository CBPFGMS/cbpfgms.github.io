import { SVGOverlay, useMap } from "react-leaflet";
import { useRef, useEffect } from "react";
import createMap from "../charts/createmap";
import { extent } from "d3-array";
import type { DatumCountries } from "../utils/processdatacountries";
import type { List } from "../utils/makelists";

export type SVGOverlayComponentProps = {
	data: DatumCountries[];
	maxZoomValue: number;
	maxValue: number;
	maxCircleRadius: number;
	minCircleRadius: number;
	lists: List;
};

function SVGOverlayComponent({
	data,
	maxZoomValue,
	maxValue,
	maxCircleRadius,
	minCircleRadius,
	lists,
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
				lists,
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
			<g
				ref={svgGroupRef}
				style={{ pointerEvents: "auto" }}
			/>
		</SVGOverlay>
	);
}

function calculateBounds(
	data: DatumCountries[]
): [[number, number], [number, number]] {
	const latitudeExtent = extent(data, d => d.latitude) as [number, number];
	const longitudeExtent = extent(data, d => d.longitude) as [number, number];
	return [
		[latitudeExtent[0], longitudeExtent[0]],
		[latitudeExtent[1], longitudeExtent[1]],
	];
}

export default SVGOverlayComponent;
