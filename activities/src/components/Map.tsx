import { useRef, useEffect, type ComponentProps } from "react";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import type { Map as MapType, LeafletMouseEvent } from "leaflet";
import { constants } from "../utils/constants";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
// import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import type { MapDatum } from "../utils/processmapdata";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { List } from "../utils/makelists";
import zoomToBounds from "../utils/calculatebounds";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import ZoomOutButton from "./ZoomOutButton";
import Button from "@mui/material/Button";

type MarkerClusterGroupProps = ComponentProps<typeof MarkerClusterGroup>;

type MarkerClusterType = Parameters<
	NonNullable<MarkerClusterGroupProps["iconCreateFunction"]>
>[0];

const createBadgeIcon = (count: number) => {
	const badgeHtml =
		count > 0 ? `<span class="marker-badge">${count}</span>` : "";

	return L.divIcon({
		className: "custom-badge-icon",
		html: `
        <img class="badge-marker-shadow" src="${iconShadow}" />
        <img class="badge-marker-icon" src="${icon}" />
        ${badgeHtml}
    `,
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34],
	});
};

const createBlueClusterIcon = (cluster: MarkerClusterType): L.DivIcon => {
	const count: number = cluster.getChildCount();

	let bgColor = "rgba(183, 226, 253, 0.6)";
	let textColor = "#014468";
	let ringColor = "rgba(215, 237, 248, 0.6)";

	if (count >= 20) {
		bgColor = "rgba(29, 78, 216, 0.6)";
		textColor = "#ffffff";
		ringColor = "rgba(24, 76, 218, 0.6)";
	} else if (count >= 10) {
		bgColor = "rgba(70, 185, 235, 0.6)";
		textColor = "#222";
		ringColor = "rgba(65, 184, 239, 0.6)";
	}

	const html: string = `
    <div style="
      background-color: ${ringColor};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        background-color: ${bgColor};
        color: ${textColor};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
        font-size: 12px;
        font-weight: bold;
      ">
        ${count}
      </div>
    </div>
  `;

	return L.divIcon({
		html: html,
		className: "custom-blue-cluster",
		iconSize: L.point(40, 40),
	});
};

const { mapHeight, minZoomValue, maxZoomValue } = constants;

type MapProps = {
	mapData: MapDatum[];
	lists: List;
	setShowList: React.Dispatch<React.SetStateAction<boolean>>;
	setProjectsList: React.Dispatch<React.SetStateAction<string[]>>;
};

const mapPadding = 10;

function Map({ mapData, lists, setShowList, setProjectsList }: MapProps) {
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
				iconCreateFunction={createBlueClusterIcon}
				chunkedLoading
				maxClusterRadius={40}
				onMouseOver={(e: LeafletMouseEvent) => {
					const cluster = e.propagatedFrom;
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
						eventHandlers={{
							mouseover: e => e.target.openPopup(),
						}}
						// title={datum.locationName}
						icon={createBadgeIcon(datum.activities.length)}
					>
						<Popup
							// direction="auto"
							offset={[0, -10]}
							// opacity={1}
							// permanent={false}
							interactive={true}
						>
							<div
								style={{
									textAlign: "left",
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
											{lists.activities[d.activity]}
											{" (sector: "}
											<strong>
												{lists.sectors[d.sector]}
											</strong>
											{")"}
										</li>
									))}
								</ul>
								<br />
								<Button
									variant="contained"
									size="small"
									sx={{
										backgroundColor: "#4a5f78",
										color: "white",
										fontWeight: 500,
										borderRadius: "8px",
										textTransform: "none",
										"&:hover": {
											backgroundColor: "#607b9c",
											color: "white",
										},
									}}
									onClick={() => {
										setProjectsList(
											Array.from(datum.projects),
										);
										setShowList(true);
									}}
								>
									View{" "}
									{datum.projects.size > 1
										? "Projects"
										: "Project"}
								</Button>
							</div>
						</Popup>
					</Marker>
				))}
			</MarkerClusterGroup>
		</MapContainer>
	);
}

function MapController({ mapData }: { mapData: MapDatum[] }) {
	const leafletMap = useMap();

	useEffect(() => {
		zoomToBounds({
			mapData,
			leafletMap,
			mapPadding,
			maxZoomValue,
		});
	}, [mapData, leafletMap]);

	return (
		<ZoomOutButton
			mapData={mapData}
			maxZoomValue={maxZoomValue}
			mapPadding={mapPadding}
			leafletMap={leafletMap}
		/>
	);
}

export default Map;
