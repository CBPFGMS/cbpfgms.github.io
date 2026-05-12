import { useRef, useEffect } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Tooltip,
	useMap,
} from "react-leaflet";
import type { Map as MapType, LeafletMouseEvent } from "leaflet";
import { constants } from "../utils/constants";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import type { MapDatum } from "../utils/processmapdata";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { List } from "../utils/makelists";
import calculateBounds from "../utils/calculatebounds";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

const DefaultIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const { mapHeight, minZoomValue, maxZoomValue } = constants;

type MapProps = {
	mapData: MapDatum[];
	lists: List;
};

const mapPadding = 10;

function Map({ mapData, lists }: MapProps) {
	const mapRef = useRef<MapType | null>(null);

	return (
		<MapContainer
			style={{ height: `${mapHeight}px`, width: "100%" }}
			center={[0, 0]}
			zoom={minZoomValue}
			scrollWheelZoom={true}
			attributionControl={false}
			ref={mapRef}
		>
			<TileLayer
				url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
				attribution="&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>"
				subdomains={"abcd"}
				maxZoom={maxZoomValue}
				minZoom={minZoomValue}
			/>
			<MapController mapData={mapData} />
			<MarkerClusterGroup
				chunkedLoading
				maxClusterRadius={40}
				onMouseOver={(e: LeafletMouseEvent) => {
					const cluster = e.layer;
					const count = cluster.getChildCount();

					cluster
						.bindTooltip(
							`This area contains ${count} locations.<br />Click to zoom in.`,
							{
								direction: "top",
								opacity: 0.9,
								offset: [0, -18],
							},
						)
						.openTooltip();
				}}
			>
				{mapData.map((datum, index) => (
					<Marker
						key={index}
						position={[datum.latitude, datum.longitude]}
						// title={datum.locationName}
						// icon={customIcon}
					>
						<Tooltip
							direction="auto"
							offset={[0, -10]}
							opacity={1}
							permanent={false} // Only shows on hover
						>
							<div
								style={{
									textAlign: "left",
									maxWidth: 300,
									minWidth: 250,
									textWrap: "wrap",
								}}
							>
								Location: <strong>{datum.locationName} </strong>
								{datum.parentLocationName && (
									<>(in {datum.parentLocationName})</>
								)}
								<br />
								<div
									style={{
										marginTop: "0.75em",
									}}
								>
									{" "}
									{datum.activities.length > 1
										? "Activities: "
										: "Activity: "}
								</div>
								<ul
									style={{
										margin: "2px 0 0 0",
										paddingLeft: "1.2rem", // Reduces the default heavy indent
										listStyleType: "disc",
									}}
								>
									{datum.activities.map((d, index) => (
										<li key={index}>
											{lists.activities[d.activity] +
												" (sector: " +
												lists.sectors[d.sector] +
												")"}
										</li>
									))}
								</ul>
							</div>
						</Tooltip>
					</Marker>
				))}
			</MarkerClusterGroup>
		</MapContainer>
	);
}

function MapController({ mapData }: { mapData: MapDatum[] }) {
	const leafletMap = useMap();

	useEffect(() => {
		const bounds = calculateBounds(mapData);
		leafletMap.fitBounds(bounds, {
			padding: [mapPadding, mapPadding],
			maxZoom: maxZoomValue,
		});
	}, [mapData, leafletMap]);

	return null;
}

export default Map;
