import React, { useContext } from "react";
import { DatumGBV } from "../utils/processdatasummary";
import { DownloadStates, ImplementationStatuses } from "./MainContainer";
import DataContext, { DataContextType } from "../context/DataContext";
import downloadData from "../utils/downloaddata";
import { processGBVDownload } from "../utils/processdownload";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DownloadIcon from "./DownloadIcon";
import Container from "@mui/material/Container";
import colors from "../utils/colors";
import InfoIcon from "@mui/icons-material/Info";
import NumberAnimator from "./NumberAnimator";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import Donut from "./GBVDonut";
import formatSIFloat from "../utils/formatsi";
import { format } from "d3";

type GBVChartProps = {
	dataGBV: DatumGBV;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationStatus: ImplementationStatuses[];
};

export type DonutDatum = {
	value: number;
	type: "total" | "GBV";
};

type GBVCellProps = {
	title: string;
	totalSlice: number;
	GBVSlice: number;
	totalColor: string;
	GBVColor: string;
	CaptionIcon: React.ReactElement;
};

function GBVChart({
	dataGBV,
	clickedDownload,
	setClickedDownload,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
}: GBVChartProps) {
	const { data, lists } = useContext(DataContext) as DataContextType;

	function handleDownloadClick() {
		const dataGBVDownload = processGBVDownload({
			data,
			lists,
			year,
			fund,
			allocationSource,
			allocationType,
			implementationStatus,
		});
		downloadData<(typeof dataGBVDownload)[number]>(
			dataGBVDownload,
			"GBV_marker"
		);
	}

	return (
		<Container
			disableGutters={true}
			style={{
				position: "relative",
			}}
		>
			<DownloadIcon
				handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type="gbv"
			/>
			<Box
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "58px",
					flexDirection: "row",
				}}
				mb={1}
			>
				<Typography
					style={{
						fontSize: "1rem",
						fontWeight: 500,
						textTransform: "uppercase",
					}}
				>
					GBV
				</Typography>
				<InfoIcon
					data-tooltip-id="tooltip"
					data-tooltip-content={"Gender-Based Violence"}
					data-tooltip-place="top"
					style={{
						color: "#666",
						fontSize: "14px",
						marginLeft: "0.1em",
						marginTop: "-0.6em",
					}}
				/>
				<Typography
					style={{
						fontSize: "1rem",
						fontWeight: 500,
						textTransform: "uppercase",
						whiteSpace: "pre",
					}}
				>
					{" "}
					Budget, Targeted and Reached People
				</Typography>
			</Box>
			<Box
				display={"flex"}
				flexDirection={"row"}
				alignItems={"center"}
				gap={1}
				width={"100%"}
				style={{ aspectRatio: "4/3" }}
			>
				<GBVColumn>
					<GBVCell
						title={"GBV Planned Budget"}
						totalSlice={dataGBV.allocations}
						totalColor={colors.unColorLighter}
						GBVSlice={dataGBV.allocationsGBVPlanned}
						GBVColor={colors.unColorDarker}
						CaptionIcon={
							<Typography variant="caption">{"$"}</Typography>
						}
					/>
					<GBVCell
						title={"GBV Reached Budget"}
						totalSlice={dataGBV.allocations}
						totalColor={colors.contrastColorLighter}
						GBVSlice={dataGBV.allocationsGBVReached}
						GBVColor={colors.contrastColorDarker}
						CaptionIcon={
							<Typography variant="caption">{"$"}</Typography>
						}
					/>
				</GBVColumn>
				<GBVColumn>
					<GBVCell
						title={"GBV Targeted People"}
						totalSlice={dataGBV.targeted}
						totalColor={colors.unColorLighter}
						GBVSlice={dataGBV.targetedGBV}
						GBVColor={colors.unColorDarker}
						CaptionIcon={
							<AdsClickIcon
								style={{
									fontSize: 18,
									marginLeft: 3,
									marginRight: 3,
									color: "#777",
									opacity: 0.6,
								}}
							/>
						}
					/>
					<GBVCell
						title={"GBV Reached People"}
						totalSlice={dataGBV.reached}
						totalColor={colors.contrastColorLighter}
						GBVSlice={dataGBV.reachedGBV}
						GBVColor={colors.contrastColorDarker}
						CaptionIcon={
							<DoneIcon
								style={{
									fontSize: 18,
									marginLeft: 3,
									marginRight: 3,
									color: "#777",
									opacity: 0.6,
								}}
							/>
						}
					/>
				</GBVColumn>
			</Box>
			<Box
				width={"100%"}
				display={"flex"}
				justifyContent={"center"}
				mt={3}
			>
				<Typography
					variant="caption"
					sx={{ lineHeight: 1.2, width: "80%", fontStyle: "italic" }}
				>
					The data on GBV reached, as reported only in the final
					reports was identified from{" "}
					{format(".1~%")(
						dataGBV.reportsWithData / dataGBV.totalReports
					)}{" "}
					of the projects. Possible many project(s) have not reached
					the due date of final reports based on the selected filters.
				</Typography>
			</Box>
		</Container>
	);
}

function GBVColumn({ children }: { children: React.ReactNode[] }) {
	return (
		<Box
			display={"flex"}
			flex={"0 50%"}
			height={"100%"}
			gap={3}
			flexDirection={"column"}
		>
			{children[0]}
			{children[1]}
		</Box>
	);
}

function GBVCell({
	title,
	totalSlice,
	totalColor,
	GBVSlice,
	GBVColor,
	CaptionIcon,
}: GBVCellProps) {
	return (
		<Box
			display={"flex"}
			flex={"0 50%"}
			flexDirection={"column"}
			alignItems={"center"}
			justifyContent={"center"}
			data-tooltip-id="tooltip"
			data-tooltip-html={`<div style='text-align:center;'>${title}: ${
				title.toLowerCase().includes("budget") ? "$" : ""
			}${format(",.0f")(GBVSlice)}<br />(${
				~~((GBVSlice * 10000) / totalSlice) / 100
			}% of ${title.toLowerCase().includes("budget") ? "$" : ""}${format(
				",.0f"
			)(totalSlice)})</div>`}
			data-tooltip-place="top"
		>
			<Typography
				mb={0.5}
				variant="subtitle1"
			>
				{title}
			</Typography>
			<Box
				display={"flex"}
				width={"100%"}
				height={"100%"}
			>
				<Donut
					totalSlice={totalSlice}
					totalColor={totalColor}
					GBVSlice={GBVSlice}
					GBVColor={GBVColor}
				/>
			</Box>
			<Box
				display={"flex"}
				width={"100%"}
				flexDirection={"row"}
				alignItems={"center"}
				justifyContent={"center"}
				mt={1}
			>
				<Typography
					variant="caption"
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					{CaptionIcon}
					<NumberAnimator
						number={parseFloat(formatSIFloat(GBVSlice))}
						type="decimal"
					/>
					{isNaN(+formatSIFloat(GBVSlice).slice(-1))
						? formatSIFloat(GBVSlice).slice(-1)
						: ""}
				</Typography>
			</Box>
		</Box>
	);
}

const MemoizedGBVChart = React.memo(GBVChart);

export default MemoizedGBVChart;
