import { useRef } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { Map as MapType } from "leaflet";
import { constants } from "../utils/constants";
import 'leaflet/dist/leaflet.css';

const { mapHeight, minZoomValue, maxZoomValue } = constants;

function Map() {
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
		</MapContainer>
	);
}

export default Map;
