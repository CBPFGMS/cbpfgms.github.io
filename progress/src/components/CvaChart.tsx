import React, { useContext, useRef, useState } from "react";
import {
	DatumCva,
	DatumPictogram,
	DatumSummary,
} from "../utils/processdatasummary";
import { List } from "../utils/makelists";
import { DownloadStates, ImplementationStatuses } from "./MainContainer";
import constants from "../utils/constants";
import DataContext, { DataContextType } from "../context/DataContext";
import { processCvaDownload } from "../utils/processdownload";
import downloadData from "../utils/downloaddata";
import DownloadAndImageContainer from "./DownloadAndImageContainer";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import CvaChartSwitch from "./CvaSwitch";
import CvaDonuts from "./CvaDonuts";
import Divider from "@mui/material/Divider";
import { sum } from "d3";

export type CvaChartModes = (typeof cvaChartModes)[number];

type CvaChartTypes = (typeof cvaChartTypes)[number][];

export type CvaGoal = (typeof beneficiariesStatuses)[number];

type CvaChartProps = {
	dataSummary: DatumSummary[];
	dataPictogram: DatumPictogram;
	dataCva: DatumCva[];
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationStatus: ImplementationStatuses[];
	showFinanciallyClosed: boolean;
};

const { cvaChartModes, cvaChartTypes, beneficiariesStatuses } = constants;

function CvaChart({
	dataSummary,
	dataPictogram,
	dataCva,
	clickedDownload,
	setClickedDownload,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	showFinanciallyClosed,
}: CvaChartProps) {
	const { data, lists } = useContext(DataContext) as DataContextType;

	const ref = useRef<HTMLDivElement>(null);

	const [cvaChartMode, setCvaChartMode] =
		useState<CvaChartModes>("allocations");
	const [cvaChartType, setCvaChartType] = useState<CvaChartTypes>([
		...cvaChartTypes,
	]);

	const total = sum(dataSummary, d => d.allocations);
	const { cvaTargeted, cvaReached } = dataCva.reduce(
		(acc, curr) => {
			acc.cvaTargeted += curr.targetedAllocations;
			acc.cvaReached += curr.reachedAllocations;
			return acc;
		},
		{ cvaTargeted: 0, cvaReached: 0 }
	);

	function handleDownloadClick() {
		const dataCvaDownload = processCvaDownload({
			data,
			lists,
			year,
			fund,
			allocationSource,
			allocationType,
			implementationStatus,
			showFinanciallyClosed,
		});
		downloadData<(typeof dataCvaDownload)[number]>(dataCvaDownload, "CVA");
	}

	function handleSwitchChange() {
		setCvaChartMode(
			cvaChartMode === "allocations" ? "people" : "allocations"
		);
	}

	return (
		<Container
			disableGutters={true}
			style={{ position: "relative" }}
			ref={ref}
		>
			<DownloadAndImageContainer
				handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type="summary"
				refElement={ref}
				fileName="summary"
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
					Cash and Voucher Assistance
				</Typography>
			</Box>
			<Grid
				container
				spacing={1}
				style={{
					alignItems: "center",
					justifyContent: "center",
					height: "240px",
				}}
			>
				<Grid
					size={5.2}
					style={{
						height: "100%",
						outline: "1px solid black",
						display: "flex",
						opacity: cvaChartMode === "allocations" ? 1 : 0.8,
						filter: `grayscale(${
							cvaChartMode === "allocations" ? 0 : 0.75
						})`,
					}}
				>
					<Box
						display={"flex"}
						style={{ height: "100%", width: "100%" }}
					>
						<CvaDonuts
							totalValue={total}
							cvaValue={cvaTargeted}
							cvaMode="allocations"
							cvaGoal="targeted"
						/>
						<Divider
							orientation="vertical"
							flexItem
							variant="middle"
							sx={{ borderStyle: "dashed" }}
						/>
						<CvaDonuts
							totalValue={total}
							cvaValue={cvaReached}
							cvaMode="allocations"
							cvaGoal="reached"
						/>
					</Box>
				</Grid>
				<CvaChartSwitch
					cvaChartMode={cvaChartMode}
					handleSwitchChange={handleSwitchChange}
				></CvaChartSwitch>
				<Grid
					size={5.2}
					style={{
						backgroundColor: "wheat",
						height: "100%",
						display: "flex",
						opacity: cvaChartMode === "people" ? 1 : 0.8,
						filter: `grayscale(${
							cvaChartMode === "allocations" ? 0 : 0.75
						})`,
					}}
				>
					<Box></Box>
				</Grid>
			</Grid>
		</Container>
	);
}

const MemoisedCvaChart = React.memo(CvaChart);

export default MemoisedCvaChart;
