import React, { useContext, useEffect, useRef, useState } from "react";
import { DatumEmergency } from "../utils/processdatasummary";
import { DownloadStates, ImplementationStatuses } from "./MainContainer";
import constants from "../utils/constants";
import DataContext, { DataContextType } from "../context/DataContext";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import colors from "../utils/colors";
import { processEmergenciesDownload } from "../utils/processdownload";
import downloadData from "../utils/downloaddata";
import DownloadAndImageContainer from "./DownloadAndImageContainer";
import Grid from "@mui/material/Grid2";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import BarChartIcon from "@mui/icons-material/BarChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import CategoryIcon from "@mui/icons-material/Category";
import ListIcon from "@mui/icons-material/List";
import createEmergency from "../charts/createemergency";

export type EmergencyChartModes = (typeof emergencyChartModes)[number];

export type EmergencyChartTypes = (typeof emergencyChartTypes)[number];

const { emergencyChartModes, emergencyChartTypes } = constants;

const buttonSx = {
	"& .MuiToggleButton-root": {
		"&.Mui-selected": {
			backgroundColor: colors.unColor,
			color: "#fff",
			"&.Mui-selected:hover": {
				backgroundColor: colors.unColor,
				filter: "brightness(0.9)",
			},
		},
	},
};

type EmergencyChartProps = {
	dataEmergency: DatumEmergency[];
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationStatus: ImplementationStatuses[];
	showFinanciallyClosed: boolean;
};

function EmergencyChart({
	dataEmergency,
	clickedDownload,
	setClickedDownload,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	showFinanciallyClosed,
}: EmergencyChartProps) {
	const { data, lists } = useContext(DataContext) as DataContextType;

	const [type, setType] = useState<EmergencyChartTypes>("overview"); //CHANGE THIS TO TIMELINE
	const [mode, setMode] = useState<EmergencyChartModes>("aggregated");

	const ref = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const svgContainerRef = useRef<HTMLDivElement>(null);

	const [svgContainerWidth, setSvgContainerWidth] = useState<number>(0);

	const handleType = (
		event: React.MouseEvent<HTMLElement>,
		newType: EmergencyChartTypes | null
	) => {
		if (newType !== null) {
			setType(newType);
		}
	};

	const handleMode = (
		event: React.MouseEvent<HTMLElement>,
		newMode: EmergencyChartModes | null
	) => {
		if (newMode !== null) {
			setMode(newMode);
		}
	};

	function handleDownloadClick() {
		const dataEmergenciesDownload = processEmergenciesDownload({
			data,
			lists,
			year,
			fund,
			allocationSource,
			allocationType,
			implementationStatus,
			showFinanciallyClosed,
		});
		downloadData<(typeof dataEmergenciesDownload)[number]>(
			dataEmergenciesDownload,
			"emergencies"
		);
	}

	useEffect(() => {
		if (svgContainerRef.current) {
			setSvgContainerWidth(svgContainerRef.current.offsetWidth);
		}
	}, []);

	useEffect(() => {
		if (svgRef.current) {
			createEmergency({
				svgRef,
				svgContainerWidth,
				dataEmergency,
				lists,
				mode,
				type,
			});
		}
	}, [svgContainerWidth, dataEmergency, mode, type, lists]);

	return (
		<Container
			disableGutters={true}
			style={{
				position: "relative",
			}}
			ref={ref}
		>
			<DownloadAndImageContainer
				handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type="emergency"
				refElement={ref}
				fileName="emergencies"
			/>
			<Box
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "58px",
					flexDirection: "column",
				}}
				mb={3}
			>
				<Typography
					style={{
						fontSize: "1rem",
						fontWeight: 500,
						textTransform: "uppercase",
					}}
				>
					Allocations by Emergency group
				</Typography>
			</Box>
			<Grid
				container
				direction={"row"}
				justifyContent={"center"}
				alignItems={"center"}
				spacing={2}
				size={12}
				flexWrap={"nowrap"}
				mt={2}
				mb={3}
			>
				<Grid
					size={6}
					direction={"row"}
					flexWrap={"nowrap"}
					justifyContent={"center"}
					alignItems={"center"}
					container
				>
					<Typography variant="body1">
						Select the chart type:
					</Typography>
					<ToggleButtonGroup
						value={type}
						exclusive
						onChange={handleType}
						size="small"
						sx={buttonSx}
					>
						<ToggleButton value="overview">
							<BarChartIcon sx={{ transform: "rotate(90deg)" }} />
							<Typography
								ml={1}
								variant="button"
							>
								Overview
							</Typography>
						</ToggleButton>
						<ToggleButton value="timeline">
							<TimelineIcon />
							<Typography
								ml={1}
								variant="button"
							>
								Time series
							</Typography>
						</ToggleButton>
					</ToggleButtonGroup>
				</Grid>
				<Grid
					size={6}
					direction={"row"}
					flexWrap={"nowrap"}
					justifyContent={"center"}
					alignItems={"center"}
					container
				>
					<Typography variant="body1">
						Select the aggregation level:
					</Typography>
					<ToggleButtonGroup
						value={mode}
						exclusive
						onChange={handleMode}
						size="small"
						sx={buttonSx}
					>
						<ToggleButton value="aggregated">
							<CategoryIcon />
							<Typography
								ml={1}
								variant="button"
							>
								Aggregated
							</Typography>
						</ToggleButton>
						<ToggleButton value="byGroup">
							<ListIcon />
							<Typography
								ml={1}
								variant="button"
							>
								By group
							</Typography>
						</ToggleButton>
					</ToggleButtonGroup>
				</Grid>
			</Grid>
			<Grid
				container
				justifyContent={"center"}
				alignItems={"center"}
				mt={2}
			>
				<Box
					width={"96%"}
					style={{ outline: "1px solid green" }}
					ref={svgContainerRef}
				>
					<svg ref={svgRef}></svg>
				</Box>
			</Grid>
		</Container>
	);
}

const MemoisedEmergencyChart = React.memo(EmergencyChart);

export default MemoisedEmergencyChart;
