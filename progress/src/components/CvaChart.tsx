import React, { useContext, useRef, useState, useMemo } from "react";
import {
	DatumCva,
	DatumPictogram,
	DatumSummary,
} from "../utils/processdatasummary";
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
import CvaTopChart from "./CvaTopChart";
import processCvaSectors from "../utils/processcvasectors";
import CvaSectors from "./CvaSectors";

export type CvaChartModes = (typeof cvaChartModes)[number];

export type CvaChartTypes = (typeof cvaChartTypes)[number][];

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
	const totalPeopleTargeted = sum(
			Object.entries(dataPictogram),
			([key, value]) => (key.includes("targeted") ? value : 0)
		),
		totalPeopleReached = sum(
			Object.entries(dataPictogram),
			([key, value]) => (key.includes("reached") ? value : 0)
		),
		cvaPeopleTargeted = sum(dataCva, d => d.targetedPeople),
		cvaPeopleReached = sum(dataCva, d => d.reachedPeople);

	const cvaSectorsData = useMemo(
		() => processCvaSectors(dataCva, cvaChartType, cvaChartMode),
		[dataCva, cvaChartType, cvaChartMode]
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
					height: "220px",
				}}
			>
				<Grid
					size={5.2}
					style={{
						height: "100%",
						display: "flex",
						opacity: cvaChartMode === "allocations" ? 1 : 0.7,
						filter: `grayscale(${
							cvaChartMode === "allocations" ? 0 : 1
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
							sx={{
								borderStyle: "dashed",
								borderColor: "rgba(0,0,0,0.25)",
							}}
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
						height: "100%",
						display: "flex",
						opacity: cvaChartMode === "people" ? 1 : 0.7,
						filter: `grayscale(${
							cvaChartMode === "people" ? 0 : 1
						})`,
					}}
				>
					<Box
						display={"flex"}
						style={{ height: "100%", width: "100%" }}
					>
						<CvaDonuts
							totalValue={totalPeopleTargeted}
							cvaValue={cvaPeopleTargeted}
							cvaMode="people"
							cvaGoal="targeted"
						/>
						<Divider
							orientation="vertical"
							flexItem
							variant="middle"
							sx={{
								borderStyle: "dashed",
								borderColor: "rgba(0,0,0,0.25)",
							}}
						/>
						<CvaDonuts
							totalValue={totalPeopleReached}
							cvaValue={cvaPeopleReached}
							cvaMode="people"
							cvaGoal="reached"
						/>
					</Box>
				</Grid>
			</Grid>
			<Box
				display={"flex"}
				flexDirection={"column"}
				alignItems={"center"}
			>
				<CvaTopChart
					dataCva={dataCva}
					cvaChartType={cvaChartType}
					cvaChartMode={cvaChartMode}
					setCvaChartType={setCvaChartType}
					lists={lists}
				/>
				<CvaSectors
					data={cvaSectorsData}
					lists={lists}
				/>
			</Box>
		</Container>
	);
}

const MemoisedCvaChart = React.memo(CvaChart);

export default MemoisedCvaChart;
