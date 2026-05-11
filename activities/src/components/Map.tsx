import { useRef } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import type { Map as MapType } from "leaflet";
import { constants } from "../utils/constants";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import type { MapDatum } from "../utils/processmapdata";
import MarkerClusterGroup from "react-leaflet-cluster";

const { mapHeight, minZoomValue, maxZoomValue } = constants;

type MapProps = {
	mapData: MapDatum[];
};

function Map({ mapData }: MapProps) {
	const mapRef = useRef<MapType | null>(null);

	return (
		<MapContainer
			style={{ height: `${mapHeight}px`, width: "100%" }}
			center={[0, 0]}
			zoom={minZoomValue}
			scrollWheelZoom={false}
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
			<MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
				{mapData.map((datum, index) => (
					<Marker
						key={index}
						position={[datum.latitude, datum.longitude]}
						title={datum.locationName}
						// icon={customIcon}
					></Marker>
				))}
			</MarkerClusterGroup>
		</MapContainer>
	);
}

export default Map;
