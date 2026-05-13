import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import L, { type Map as MapType } from "leaflet";
import IconButton from "@mui/material/IconButton";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import Paper from "@mui/material/Paper";
import zoomToBounds from "../utils/calculatebounds";
import type { MapDatum } from "../utils/processmapdata";

type ZoomOutControlProps = {
	mapData: MapDatum[];
	maxZoomValue: number;
	mapPadding: number;
	leafletMap: MapType;
};

function ZoomOutControl({
	mapData,
	maxZoomValue,
	mapPadding,
	leafletMap,
}: ZoomOutControlProps) {
	// 1. Create a container element that Leaflet will hold
	const container = useMemo(() => {
		const div = L.DomUtil.create("div", "leaflet-control leaflet-bar");
		div.title = "Zoom to fit all markers";
		// Stop clicks on the button from dragging or clicking the map underneath
		L.DomEvent.disableClickPropagation(div);
		return div;
	}, []);

	useEffect(() => {
		// 1. Create a generic Control instance
		const control = new L.Control({ position: "topleft" });

		// 2. Manually override the onAdd method
		control.onAdd = () => container;

		// 3. Add to map
		control.addTo(leafletMap);

		// 4. Return the cleanup function
		return () => {
			control.remove();
		};
	}, [container, leafletMap]);

	// 4. Use a Portal to render the MUI Button into the Leaflet container
	return createPortal(
		<Paper
			elevation={2}
			sx={{
				borderRadius: "4px",
				"&:hover": { backgroundColor: "#f4f4f4" },
			}}
		>
			<IconButton
				onClick={() =>
					zoomToBounds({
						mapData,
						leafletMap,
						mapPadding,
						maxZoomValue,
					})
				}
				size="small"
				sx={{
					backgroundColor: "white",
					width: "30px", // Matches standard Leaflet zoom button width
					height: "30px",
					padding: "5px",
					color: "#444",
				}}
			>
				<ZoomOutMapIcon fontSize="small" />
			</IconButton>
		</Paper>,
		container,
	);
}

export default ZoomOutControl;
