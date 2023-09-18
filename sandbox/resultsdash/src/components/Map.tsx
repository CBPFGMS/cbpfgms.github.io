import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { MapContainer, TileLayer, SVGOverlay, useMap } from "react-leaflet";
import DownloadIcon from "./DownloadIcon";
import { useRef, useEffect } from "react";
import createMap from "../charts/createmap";
import { extent } from "d3-array";
import { useInView } from "react-intersection-observer";
import { Tooltip } from "react-tooltip";

function SVGOverlayComponent({ data, maxZoomValue }: SVGOverlayComponentProps) {
	const map = useMap();
	const svgGroupRef = useRef<SVGSVGElement | null>(null);
	const maxCircleRadius = 20;

	useEffect(() => {
		const bounds = calculateBounds(data);
		map.flyToBounds(bounds, {
			paddingTopLeft: [maxCircleRadius, maxCircleRadius],
			paddingBottomRight: [maxCircleRadius, maxCircleRadius],
			maxZoom: maxZoomValue,
		});
		if (svgGroupRef.current) {
			createMap({ data, svgGroupRef, maxCircleRadius });
		}
	}, [data, map, maxZoomValue]);

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

function Map({ data, clickedDownload, setClickedDownload }: MapProps) {
	const maxZoomValue = 12;
	const mapHeight = 512;

	function handleDownloadClick() {}

	const [ref, inView] = useInView({
		threshold: 0,
	});

	return (
		<Container
			disableGutters={true}
			style={{
				position: "relative",
			}}
		>
			<Tooltip
				id={"tooltip-map"}
				style={{ zIndex: 1999 }}
			/>
			<DownloadIcon
				handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type={"map"}
			/>
			<Box
				ref={ref}
				style={{
					display: "flex",
					justifyContent: "center",
				}}
				mb={3}
				pt={1}
			>
				<Typography
					style={{
						fontSize: "1rem",
						fontWeight: 500,
						textTransform: "uppercase",
					}}
				>
					Geographic location of people targeted and reached
				</Typography>
			</Box>
			<Box style={{ width: "100%" }}>
				<MapContainer
					style={{ height: `${mapHeight}px`, width: "100%" }}
					center={[0, 0]}
					zoom={2}
					scrollWheelZoom={false}
				>
					<TileLayer
						url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
						attribution="&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>"
						subdomains={"abcd"}
						maxZoom={maxZoomValue}
					/>
					{inView && (
						<SVGOverlayComponent
							data={data}
							maxZoomValue={maxZoomValue}
						/>
					)}
				</MapContainer>
			</Box>
		</Container>
	);
}

function calculateBounds(
	data: MapData[]
): [[number, number], [number, number]] {
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

export default Map;
