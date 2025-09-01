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
import { chartsGridClasses } from "@mui/x-charts/ChartsGrid";
import { type CurveType } from "@mui/x-charts";
import Chip from "@mui/material/Chip";
import { processTimelineDownload } from "../utils/processdownload";
import downloadData from "../utils/downloaddata";

type TimelineChartProps = {
	timelineData: TimelineDatum[];
	lists: List;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	fund: number[];
	inDataLists: InDataLists;
};

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
	const [showChip, setShowChip] = useState<boolean>(true);

	if (fund.length !== inDataLists.funds.size && showChip === true) {
		setShowChip(false);
	}

	function handleDeleteChip() {
		setShowChip(false);
	}

	useEffect(() => {
		if (ref.current) {
			setContainerWidth(ref.current.clientWidth);
		}
	}, []);

	const totalSeries = {
		id: "total",
		dataKey: "cvaPercentage",
		label: "All funds CVA percentage",
		curve: "catmullRom" as CurveType,
		color: "#000",
		valueFormatter: (value: number | null) =>
			value !== null ? value.toFixed(1) + "%" : "N/A",
	};

	const fundSeries = Array.from(fund).map(fundId => ({
		dataKey: `${fundId}CvaPercentage`,
		label: lists.fundNames[fundId],
		curve: "catmullRom" as CurveType,
		valueFormatter: (value: number | null) =>
			value !== null ? value.toFixed(1) + "%" : "N/A",
	}));

	fundSeries.unshift(totalSeries);

	const series =
		fund.length === inDataLists.funds.size ? [totalSeries] : fundSeries;

	const timelineYears = timelineData.map(d => d.year);

	function handleDownloadClick() {
		const dataCvaTimelineDownload = processTimelineDownload({
			data: timelineData,
			lists,
			fund,
			inDataLists,
		});
		downloadData<(typeof dataCvaTimelineDownload)[number]>(
			dataCvaTimelineDownload,
			"cva_timeline"
		);
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
						CVA Percentage Trends
						<InfoIcon
							data-tooltip-id="tooltip"
							data-tooltip-content={
								"Mouse over a given year to see CVA percentages for that year. The dark dashed line represents the total CVA percentage across all funds. Select a fund on the 'Allocations by fund' chart on the left hand side to view its trend over time."
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
			{showChip && (
				<Box
					display={"flex"}
					flexDirection={"row"}
					width={"95%"}
					marginLeft={"3%"}
					alignItems={"center"}
					justifyContent={"center"}
				>
					<Chip
						label="Select a fund on the left to show its trend over time"
						variant="outlined"
						onDelete={handleDeleteChip}
					/>
				</Box>
			)}
			<Box
				display={"flex"}
				flexDirection={"column"}
				width={"95%"}
				marginLeft={"3%"}
				alignItems={"center"}
				marginTop={1}
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

							valueFormatter: (value: number) =>
								Math.round(value) + "%",
							min: 1e-6,
							disableLine: true,
							disableTicks: true,
							tickNumber: 5,
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
						[`& g[data-series='total'] .${markElementClasses.root}`]:
							{
								strokeOpacity:
									fund.length === inDataLists.funds.size
										? 1
										: 0.4,
							},
						"& .MuiLineElement-root": {
							strokeWidth: 1,
						},
						"& .MuiLineElement-root[data-series='total']": {
							strokeWidth: 2.3,
							strokeDasharray: "5 3",
							opacity:
								fund.length === inDataLists.funds.size
									? 1
									: 0.4,
						},
					}}
				/>
			</Box>
		</Container>
	);
}

const memoisedTimelineChart = React.memo(TimelineChart);

export default memoisedTimelineChart;
