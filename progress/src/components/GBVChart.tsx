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
					data-tooltip-content={
						"Loren ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, purus nec ultricies."
					}
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
				style={{ aspectRatio: "16/9" }}
			>
				<Box
					display={"flex"}
					flex={"0 60%"}
					height={"100%"}
					style={{ backgroundColor: "tomato" }}
					flexDirection={"column"}
					alignItems={"center"}
					justifyContent={"center"}
				>
					<Typography
						mt={1}
						mb={1}
						variant="subtitle1"
					>
						GBV Budget
					</Typography>
					<Box
						display={"flex"}
						width={"100%"}
						height={"100%"}
					>
						<Donut
							totalSlice={dataGBV.allocations}
							totalColor={colors.unColorLighter}
							GBVSlice={dataGBV.allocationsGBVPlanned}
							GBVColor={colors.unColorDarker}
							main={true}
						/>
					</Box>
					<Box
						display={"flex"}
						width={"100%"}
						flexDirection={"row"}
						alignItems={"center"}
						justifyContent={"center"}
						mt={1}
						mb={1}
					>
						<Typography variant="caption">
							{"$"}
							<NumberAnimator
								number={Math.round(
									dataGBV.allocationsGBVPlanned
								)}
								type="integer"
							/>
						</Typography>
					</Box>
				</Box>
				<Box
					display={"flex"}
					flexDirection={"column"}
					flex={"0 40%"}
					gap={1}
					height={"100%"}
				>
					<Box
						display={"flex"}
						flex={"0 50%"}
						style={{ backgroundColor: "skyblue" }}
						flexDirection={"column"}
						alignItems={"center"}
						justifyContent={"center"}
					>
						<Typography
							mb={0.5}
							variant="subtitle1"
						>
							Targeted People
						</Typography>
						<Box
							display={"flex"}
							width={"100%"}
							height={"100%"}
						>
							<Donut
								totalSlice={dataGBV.targeted}
								totalColor={colors.unColorLighter}
								GBVSlice={dataGBV.targetedGBV}
								GBVColor={colors.unColorDarker}
								main={false}
							/>
						</Box>
						<Box
							display={"flex"}
							width={"100%"}
							flexDirection={"row"}
							alignItems={"center"}
							justifyContent={"center"}
							mt={0.5}
							mb={0.5}
						>
							<Typography
								variant="caption"
								style={{
									display: "flex",
									alignItems: "center",
								}}
							>
								<AdsClickIcon
									style={{
										fontSize: 18,
										marginLeft: 3,
										marginRight: 3,
										color: "#777",
										opacity: 0.6,
									}}
								/>
								<NumberAnimator
									number={dataGBV.targetedGBV}
									type="integer"
								/>
							</Typography>
						</Box>
					</Box>
					<Box
						display={"flex"}
						flex={"0 50%"}
						style={{ backgroundColor: "skyblue" }}
						flexDirection={"column"}
						alignItems={"center"}
						justifyContent={"center"}
					>
						<Typography
							mb={0.5}
							variant="subtitle1"
						>
							Reached People
						</Typography>
						<Box
							display={"flex"}
							width={"100%"}
							height={"100%"}
						>
							<Donut
								totalSlice={dataGBV.reached}
								totalColor={colors.contrastColorLighter}
								GBVSlice={dataGBV.reachedGBV}
								GBVColor={colors.contrastColorDarker}
								main={false}
							/>
						</Box>
						<Box
							display={"flex"}
							width={"100%"}
							flexDirection={"row"}
							alignItems={"center"}
							justifyContent={"center"}
							mt={0.5}
							mb={0.5}
						>
							<Typography
								variant="caption"
								style={{
									display: "flex",
									alignItems: "center",
								}}
							>
								<DoneIcon
									style={{
										fontSize: 18,
										marginLeft: 3,
										marginRight: 3,
										color: "#777",
										opacity: 0.6,
									}}
								/>
								<NumberAnimator
									number={dataGBV.reachedGBV}
									type="integer"
								/>
							</Typography>
						</Box>
					</Box>
				</Box>
			</Box>
		</Container>
	);
}

const MemoizedGBVChart = React.memo(GBVChart);

export default MemoizedGBVChart;
