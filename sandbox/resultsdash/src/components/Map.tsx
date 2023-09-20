import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { MapContainer, TileLayer } from "react-leaflet";
import DownloadIcon from "./DownloadIcon";
import { useRef, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { extent } from "d3-array";
import SVGOverlayComponent from "./SVGOverlayComponent";
import createSizeLegend from "../charts/createsizelegend";
import createColorLegend from "../charts/createcolorlegend";

function Map({ data, clickedDownload, setClickedDownload }: MapProps) {
	const maxZoomValue = 12;
	const minZoomValue = 2;
	const mapHeight = 512;
	const legendSvgWidth = 494;
	const legendSvgHeight = 80;
	const maxCircleRadius = 20;
	const minCircleRadius = 0.5;

	const sizeSvgRef = useRef<SVGSVGElement | null>(null);
	const colorSvgRef = useRef<SVGSVGElement | null>(null);

	function handleDownloadClick() {}

	const [ref, inView] = useInView({
		threshold: 0,
	});

	const minMaxValue = extent(
		data,
		(d): number =>
			(d.beneficiaries.targetedBoys || 0) +
			(d.beneficiaries.targetedGirls || 0) +
			(d.beneficiaries.targetedMen || 0) +
			(d.beneficiaries.targetedWomen || 0)
	) as [number, number];

	useEffect(() => {
		if (sizeSvgRef.current) {
			createSizeLegend({
				svgRef: sizeSvgRef.current,
				maxValue: minMaxValue[1],
				minValue: minMaxValue[0],
				legendSvgWidth,
				legendSvgHeight,
				maxCircleRadius,
				minCircleRadius,
			});
		}
	}, [minMaxValue]);

	useEffect(() => {
		if (colorSvgRef.current) {
			createColorLegend({
				svgRef: colorSvgRef.current,
				legendSvgWidth,
				legendSvgHeight,
			});
		}
	}, []);

	return (
		<Container
			ref={ref}
			disableGutters={true}
			style={{
				position: "relative",
			}}
		>
			<DownloadIcon
				handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type={"map"}
			/>
			<Box
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
					zoom={minZoomValue}
					scrollWheelZoom={false}
				>
					<TileLayer
						url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
						attribution="&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>"
						subdomains={"abcd"}
						maxZoom={maxZoomValue}
						minZoom={minZoomValue}
					/>
					{inView && (
						<SVGOverlayComponent
							data={data}
							maxZoomValue={maxZoomValue}
							maxValue={minMaxValue[1]}
							maxCircleRadius={maxCircleRadius}
							minCircleRadius={minCircleRadius}
						/>
					)}
				</MapContainer>
			</Box>
			<Box
				mt={2}
				style={{ marginLeft: "2%", marginRight: "2%" }}
			>
				<Typography
					variant="body1"
					style={{ fontWeight: "bold" }}
				>
					How to read this map
				</Typography>
				<Typography variant="body2">
					The map shows the geographic location of people targeted and
					reached by CBPFs. The size of the circles represents the
					number of people targeted, while the color of the circles
					represents the percentage of people reached (which can be
					greater than 100%). Hover over the circles to see the number
					of people targeted and reached by location.
				</Typography>
				<Grid
					container
					justifyContent="center"
					alignItems="center"
					spacing={2}
					style={{ marginTop: "16px" }}
					flexWrap={"nowrap"}
				>
					<Grid xs={6}>
						<Box
							style={{ display: "flex", flexDirection: "column" }}
						>
							<Typography
								variant="body2"
								style={{ fontWeight: 600, fontSize: "0.8rem" }}
							>
								Size:{" "}
								<span
									style={{
										fontSize: "0.7rem",
										fontWeight: "normal",
									}}
								>
									indicates amount of people targeted
								</span>
							</Typography>
							<svg
								ref={sizeSvgRef}
								width={legendSvgWidth}
								height={legendSvgHeight}
							></svg>
						</Box>
					</Grid>
					<Divider
						orientation="vertical"
						flexItem
						style={{
							borderLeft: "3px dotted #ccc",
							borderRight: "none",
							marginLeft: "16px",
							marginRight: "16px",
						}}
					/>
					<Grid xs={6}>
						<Box
							style={{ display: "flex", flexDirection: "column" }}
						>
							<Typography
								variant="body2"
								style={{ fontWeight: 600, fontSize: "0.8rem" }}
							>
								Color:{" "}
								<span
									style={{
										fontSize: "0.7rem",
										fontWeight: "normal",
									}}
								>
									indicates the percentage of people reached
								</span>
							</Typography>
							<svg
								ref={colorSvgRef}
								width={legendSvgWidth}
								height={legendSvgHeight}
							></svg>
						</Box>
					</Grid>
				</Grid>
			</Box>
		</Container>
	);
}

export default Map;
