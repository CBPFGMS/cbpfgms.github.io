import React, { useContext, useRef, useState } from "react";
import {
	CvaTotalPeople,
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
import Divider from "@mui/material/Divider";
import { sum } from "d3";
import CvaChartSwitch from "./CvaSwitch";
import CvaDonuts from "./CvaDonuts";
import CvaTypesChart from "./CvaTypesChart";

export type CvaChartModes = (typeof cvaChartModes)[number];

export type CvaChartTypes = (typeof cvaChartTypes)[number][];

export type CvaGoal = (typeof beneficiariesStatuses)[number];

type CvaChartProps = {
	dataSummary: DatumSummary[];
	dataPictogram: DatumPictogram;
	dataCva: DatumCva[];
	dataCvaTotalPeople: CvaTotalPeople;
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
	dataCvaTotalPeople,
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

	const total = sum(dataSummary, d => d.allocations);
	const { cvaTargeted, cvaReached } = dataCva.reduce(
		(acc, curr) => {
			acc.cvaTargeted += curr.targetedAllocations;
			acc.cvaReached += curr.reachedAllocations;
			return acc;
		},
		{ cvaTargeted: 0, cvaReached: 0 }
	);

	const { totalPeopleTargeted, totalPeopleReached } = Object.entries(
		dataPictogram
	).reduce(
		(acc, [key, value]) => {
			acc.totalPeopleTargeted += key.includes("targeted") ? value : 0;
			acc.totalPeopleReached += key.includes("reached") ? value : 0;
			return acc;
		},
		{ totalPeopleTargeted: 0, totalPeopleReached: 0 }
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
			<Box
				style={{
					display: "flex",
					width: "100%",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<CvaChartSwitch
					cvaChartMode={cvaChartMode}
					handleSwitchChange={handleSwitchChange}
				/>
			</Box>
			<Box
				mt={3}
				style={{
					display: "flex",
					width: "100%",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Box
					style={{
						width: "60%",
						minHeight: "220px",
						display: "flex",
						flexDirection: "row",
					}}
				>
					<CvaDonuts
						totalValue={
							cvaChartMode === "allocations"
								? total
								: totalPeopleTargeted
						}
						cvaValue={
							cvaChartMode === "allocations"
								? cvaTargeted
								: dataCvaTotalPeople.cvaTotalTargetedPeople
						}
						cvaMode={cvaChartMode}
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
						totalValue={
							cvaChartMode === "allocations"
								? total
								: totalPeopleReached
						}
						cvaValue={
							cvaChartMode === "allocations"
								? cvaReached
								: dataCvaTotalPeople.cvaTotalReachedPeople
						}
						cvaMode={cvaChartMode}
						cvaGoal="reached"
					/>
				</Box>
			</Box>
			<Box
				mt={4}
				style={{
					display: "flex",
					width: "100%",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<CvaTypesChart
					dataCva={dataCva}
					cvaChartMode={cvaChartMode}
					lists={lists}
					totalValue={
						cvaChartMode === "allocations"
							? cvaTargeted
							: dataCvaTotalPeople.cvaTotalTargetedPeople
					}
				></CvaTypesChart>
			</Box>
		</Container>
	);
}

const MemoisedCvaChart = React.memo(CvaChart);

export default MemoisedCvaChart;
