import React, { useRef, useEffect, useContext } from "react";
import DataContext, { type DataContextType } from "../context/DataContext";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { MapContainer, TileLayer } from "react-leaflet";
import DownloadAndImageContainer from "./DownloadAndImageContainer";
import { extent } from "d3-array";
import SVGOverlayComponent from "./SVGOverlayComponent";
import downloadData from "../utils/downloaddata";
import { Map as MapType } from "leaflet";
import type { DatumCountries } from "../utils/processdatacountries";
import type { DownloadStates } from "./MainContainer";
import { processCountryDownload } from "../utils/processdownload";

type MapProps = {
	data: DatumCountries[];
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	yearCountries: number[];
	sectorCountries: number[];
	partnerCountries: number[];
};

const maxZoomValue = 12,
	minZoomValue = 2,
	mapHeight = 512,
	maxCircleRadius = 20,
	minCircleRadius = 0.5;

function Map({
	data,
	clickedDownload,
	setClickedDownload,
	yearCountries,
	sectorCountries,
	partnerCountries,
}: MapProps) {
	const { data: completeData, lists } = useContext(
		DataContext
	) as DataContextType;

	const ref = useRef<HTMLDivElement>(null);
	const mapRef = useRef<MapType | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const zoomControlRef = useRef<HTMLDivElement | null>(null);

	function handleDownloadClick() {
		const dataCountryDownload = processCountryDownload({
			data: completeData,
			lists,
			yearCountries,
			sectorCountries,
			partnerCountries,
		});
		downloadData<(typeof dataCountryDownload)[number]>(
			dataCountryDownload,
			"CVA_countries"
		);
	}

	const minMaxValue = extent(data, d => d.allocations) as [number, number];

	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.removeControl(mapRef.current.attributionControl);
			const zoomControl = document.querySelector(".leaflet-control-zoom");
			if (zoomControl instanceof HTMLDivElement) {
				zoomControlRef.current = zoomControl;
			}
		}
	});

	return (
		<Container
			ref={ref}
			disableGutters={true}
			style={{
				position: "relative",
				zIndex: 900,
			}}
		>
			<Box ref={containerRef}>
				<DownloadAndImageContainer
					handleDownloadClick={handleDownloadClick}
					clickedDownload={clickedDownload}
					setClickedDownload={setClickedDownload}
					type={"countries"}
					refElement={containerRef}
					fileName={"CVA_countries"}
					fromMap={true}
					zoomControlRef={zoomControlRef}
				/>
				<Box style={{ width: "100%" }}>
					<MapContainer
						style={{ height: `${mapHeight}px`, width: "100%" }}
						center={[0, 0]}
						zoom={minZoomValue}
						scrollWheelZoom={false}
						ref={mapRef}
					>
						<TileLayer
							url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
							attribution="&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>"
							subdomains={"abcd"}
							maxZoom={maxZoomValue}
							minZoom={minZoomValue}
						/>
						<SVGOverlayComponent
							data={data}
							maxZoomValue={maxZoomValue}
							maxValue={minMaxValue[1]}
							maxCircleRadius={maxCircleRadius}
							minCircleRadius={minCircleRadius}
							lists={lists}
						/>
					</MapContainer>
				</Box>
			</Box>
		</Container>
	);
}

const MemoizedMap = React.memo(Map);

export default MemoizedMap;
