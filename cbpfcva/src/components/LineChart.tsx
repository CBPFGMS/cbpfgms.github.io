import React, { useRef, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import DownloadAndImageContainer from "./DownloadAndImageContainer";
import { LineChart, markElementClasses } from "@mui/x-charts/LineChart";
import type { List } from "../utils/makelists";
import type { DownloadStates } from "./MainContainer";
import type { InDataLists } from "../utils/processrawdata";
import { type TimelineDatum } from "../utils/processdata";
import InfoIcon from "@mui/icons-material/Info";
import colors from "../utils/colors";
import formatSIFloat from "../utils/formatsi";
import constants from "../utils/constants";
import { chartsGridClasses } from "@mui/x-charts/ChartsGrid";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import setFundsList from "../utils/setFundsList";
import { type CurveType } from "@mui/x-charts";
import { format } from "d3";

type TimelineChartProps = {
	timelineData: TimelineDatum[];
	lists: List;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	fund: number[];
	inDataLists: InDataLists;
};

type TimelineModes = (typeof constants.timelineModes)[number];

function TimelineChart({
	timelineData,
	lists,
	clickedDownload,
	setClickedDownload,
	fund,
	inDataLists,
}: TimelineChartProps) {
	const ref = useRef<HTMLDivElement>(null);

	const [containerWidth, setContainerWidth] = useState<number>(0);

	useEffect(() => {
		if (ref.current) {
			setContainerWidth(ref.current.clientWidth);
		}
	}, []);

	const [timelineMode, setTimelineMode] = useState<TimelineModes>("Cva");

	const series =
		fund.length === inDataLists.funds.size
			? [
					{
						dataKey:
							timelineMode === "Cva" ? "total" : "cvaPercentage",
						label: "Total CVA",
						curve: "catmullRom" as CurveType,
						valueFormatter: (value: number) =>
							timelineMode === "Cva"
								? "$" + format(",")(value)
								: value.toFixed(1) + "%",
					},
			  ]
			: Array.from(fund).map(fundId => ({
					dataKey: `${fundId}${timelineMode}`,
					label: lists.fundNames[fundId],
					curve: "catmullRom" as CurveType,
					valueFormatter: (value: number) =>
						timelineMode === "Cva"
							? "$" + format(",")(value)
							: value.toFixed(1) + "%",
			  }));

	const timelineYears = timelineData.map(d => d.year);

	function handleDownloadClick() {
		// const dataCvaTimelineDownload = processCvaTypesDownload({
		// 	data: completeData,
		// 	lists,
		// 	year,
		// 	fund,
		// 	organizationType,
		// });
		// downloadData<(typeof dataCvaTimelineDownload)[number]>(
		// 	dataCvaTimelineDownload,
		// 	"cva_timeline",
		// );
		return null;
	}

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
				type={"funds"}
				refElement={ref}
				fileName={"funds"}
			/>
			<Box
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-around",
					height: "58px",
					flexDirection: "column",
				}}
				mb={2}
			>
				<Box
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexDirection: "row",
					}}
				>
					<Typography
						style={{
							fontSize: "1rem",
							fontWeight: 500,
							textTransform: "uppercase",
						}}
					>
						CVA Timeline
						<InfoIcon
							data-tooltip-id="tooltip"
							data-tooltip-content={
								"Mouse over a given year to see XXX for that year. When no fund is selected, the darker line represents the total XXX across all funds. Select a fund on the 'Allocations by fund' chart to highlight its trend over time."
							}
							data-tooltip-place="top"
							style={{
								color: colors.unColor,
								fontSize: "20px",
								marginLeft: "0.1em",
								marginTop: "-0.4em",
								alignSelf: "flex-start",
								position: "absolute",
							}}
						/>
					</Typography>
				</Box>
			</Box>
			<Box
				display={"flex"}
				flexDirection={"column"}
				width={"95%"}
				marginLeft={"3%"}
				alignItems={"center"}
				marginBottom={3}
			>
				<ButtonGroup
					variant="outlined"
					size="small"
					aria-label="Basic button group"
				>
					<Button onClick={() => setTimelineMode("Cva")}>
						CVA amount
					</Button>
					<Button onClick={() => setTimelineMode("CvaPercentage")}>
						CVA Percentage
					</Button>
				</ButtonGroup>
			</Box>
			<Box
				display={"flex"}
				flexDirection={"row"}
				width={"95%"}
				marginLeft={"3%"}
				alignItems={"center"}
				justifyContent={"flex-start"}
				marginTop={2}
				marginBottom={3}
			>
				<Box
					style={{
						display: "flex",
						alignItems: "baseline",
					}}
				>
					<Typography
						variant="body1"
						fontSize={13}
						style={{
							color: "#222",
							fontWeight: "bold",
							border: "none",
							paddingRight: "0.5em",
						}}
					>
						Selected funds:
					</Typography>
					<Typography
						variant="body2"
						fontSize={13}
						style={{
							color: "#222",
							border: "none",
							paddingRight: "0.5em",
						}}
					>
						{setFundsList(fund, lists, inDataLists, "timeline")}
					</Typography>
				</Box>
			</Box>
			<Box
				display={"flex"}
				flexDirection={"column"}
				width={"95%"}
				marginLeft={"3%"}
				alignItems={"center"}
				gap={2}
				marginTop={2}
			>
				<LineChart
					height={400}
					width={containerWidth}
					dataset={timelineData}
					series={series}
					xAxis={[
						{
							dataKey: "year",
							valueFormatter: (value: number) => value.toString(),
							scaleType: "linear",
							min: Math.min(...timelineYears) - 0.25,
							max: Math.max(...timelineYears) + 0.25,
							tickNumber: timelineData.length,
							disableLine: true,
						},
					]}
					yAxis={[
						{
							dataKey: "totalAllocations",
							label:
								timelineMode === "Cva"
									? "Total Allocations (USD)"
									: "CVA Percentage (%)",
							valueFormatter: (value: number) =>
								timelineMode === "Cva"
									? "$" + formatSIFloat(value)
									: Math.round(value) + "%",
							min: 1e-6,
							disableLine: true,
							disableTicks: true,
							width: 72,
						},
					]}
					grid={{ horizontal: true }}
					sx={{
						[`& .${chartsGridClasses.line}`]: {
							strokeDasharray: "5 3",
							strokeWidth: 1,
						},
						"& .MuiChartsAxis-tick": {
							stroke: "transparent",
						},
						[`& .${markElementClasses.root}`]: {
							r: 4,
							fill: colors.paperColor,
						},
					}}
				/>
			</Box>
		</Container>
	);
}

const memoisedTimelineChart = React.memo(TimelineChart);

export default memoisedTimelineChart;
