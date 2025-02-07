import React, { useContext, useRef } from "react";
import DataContext, { DataContextType } from "../context/DataContext";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import Pictogram from "../assets/Pictogram";
import Divider from "@mui/material/Divider";
import { format, max } from "d3";
import Container from "@mui/material/Container";
import PictogramRow from "./PictogramRow";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import colors from "../utils/colors";
import downloadData from "../utils/downloaddata";
import { DatumPictogram } from "../utils/processdatasummary";
import { DownloadStates, ImplementationStatuses } from "./MainContainer";
import constants from "../utils/constants";
import capitalizeString from "../utils/capitalizestring";
import { processPictogramDownload } from "../utils/processdownload";
import DownloadAndImageContainer from "./DownloadAndImageContainer";

type PictogramChartProps = {
	dataPictogram: DatumPictogram;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationStatus: ImplementationStatuses[];
	showFinanciallyClosed: boolean;
};

const { beneficiaryCategories } = constants;

function PictogramChart({
	dataPictogram,
	clickedDownload,
	setClickedDownload,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	showFinanciallyClosed,
}: PictogramChartProps) {
	const { data, lists } = useContext(DataContext) as DataContextType;

	const ref = useRef<HTMLDivElement>(null);

	const totalTargeted =
		dataPictogram.targetedBoys +
		dataPictogram.targetedGirls +
		dataPictogram.targetedMen +
		dataPictogram.targetedWomen;

	const totalReached =
		dataPictogram.reachedBoys +
		dataPictogram.reachedGirls +
		dataPictogram.reachedMen +
		dataPictogram.reachedWomen;

	const maxValue = max(Object.values(dataPictogram)) || 0;
	const maxNumberOfPictograms = 22;

	function handleDownloadClick() {
		const dataPictogramDownload = processPictogramDownload({
			data,
			lists,
			year,
			fund,
			allocationSource,
			allocationType,
			implementationStatus,
			showFinanciallyClosed,
		});
		downloadData<(typeof dataPictogramDownload)[number]>(
			dataPictogramDownload,
			"people_targeted_reached"
		);
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
				type="pictogram"
				refElement={ref}
				fileName="people_targeted_reached"
			/>
			<Box
				display={"flex"}
				flexDirection={"row"}
				alignItems={"center"}
				justifyContent={"center"}
				gap={2}
				marginBottom={2}
				width={"90%"}
			>
				<Pictogram
					svgProps={{
						style: {
							fontSize: 72,
							fill: colors.unColor,
						},
					}}
					type="total"
				/>
				<Box
					display={"flex"}
					flexDirection={"column"}
					alignItems={"center"}
					justifyContent={"center"}
					gap={0}
					data-tooltip-id="tooltip"
					data-tooltip-content={`People targeted: ${format(",.0f")(
						totalTargeted
					)}`}
					data-tooltip-place="top"
				>
					<Typography
						variant="h3"
						fontWeight={500}
						style={{ color: colors.contrastColor, border: "none" }}
					>
						{totalTargeted < 1e3 ? (
							<NumberAnimator
								number={totalTargeted}
								type="integer"
							/>
						) : (
							<span>
								<NumberAnimator
									number={parseFloat(
										formatSIFloat(totalTargeted)
									)}
									type="decimal"
								/>
								{formatSIFloat(totalTargeted).slice(-1)}
							</span>
						)}
					</Typography>
					<Typography
						noWrap={true}
						style={{
							marginTop: "-0.6em",
							fontSize: 18,
							color: colors.contrastColorDarker,
							display: "flex",
							alignItems: "center",
						}}
					>
						People Targeted
						<AdsClickIcon
							style={{
								fontSize: 18,
								marginLeft: 4,
								color: "#777",
								opacity: 0.6,
							}}
						/>
					</Typography>
				</Box>
				<Divider
					orientation="vertical"
					flexItem
					style={{
						borderLeft: "2px dotted #ccc",
						borderRight: "none",
					}}
				/>
				<Box
					display={"flex"}
					flexDirection={"column"}
					alignItems={"center"}
					justifyContent={"center"}
					gap={0}
					data-tooltip-id="tooltip"
					data-tooltip-content={`People reached: ${format(",.0f")(
						totalReached
					)}`}
					data-tooltip-place="top"
				>
					<Typography
						noWrap={true}
						variant="h3"
						fontWeight={500}
						style={{ color: colors.unColor, border: "none" }}
					>
						{totalReached < 1e3 ? (
							<NumberAnimator
								number={totalReached}
								type="integer"
							/>
						) : (
							<span>
								<NumberAnimator
									number={parseFloat(
										formatSIFloat(totalReached)
									)}
									type="decimal"
								/>
								{formatSIFloat(totalReached).slice(-1)}
							</span>
						)}
						<span
							style={{
								color: "#666",
								fontSize: 14,
								fontStyle: "italic",
								marginLeft: "6px",
							}}
						>
							{"("}
							<NumberAnimator
								number={
									~~((totalReached * 100) / totalTargeted)
								}
								type="integer"
							/>
							{"%)"}
						</span>
					</Typography>
					<Typography
						noWrap={true}
						style={{
							marginTop: "-0.6em",
							fontSize: 18,
							color: colors.unColor,
							display: "flex",
							alignItems: "center",
						}}
					>
						People Reached
						<DoneIcon
							style={{
								fontSize: 18,
								marginLeft: 4,
								color: "#777",
								opacity: 0.6,
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
				gap={3}
				marginTop={4}
			>
				<Box
					mb={-2}
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "flex-end",
						textAlign: "right",
						width: "100%",
					}}
				>
					<Typography
						variant="body2"
						fontSize={12}
						style={{
							color: "#222",
							border: "none",
							fontStyle: "italic",
							letterSpacing: "-0.05em",
						}}
					>
						Reached as %<br />
						of targeted
					</Typography>
				</Box>
				{beneficiaryCategories.map(type => (
					<PictogramRow
						key={type}
						type={type}
						targeted={
							dataPictogram[
								("targeted" +
									capitalizeString(
										type
									)) as keyof DatumPictogram
							]
						}
						reached={
							dataPictogram[
								("reached" +
									capitalizeString(
										type
									)) as keyof DatumPictogram
							]
						}
						maxNumberOfPictograms={maxNumberOfPictograms}
						maxValue={maxValue}
					/>
				))}
			</Box>
			<Box
				marginLeft={"3%"}
				marginTop={4}
				display={"flex"}
				alignItems={"center"}
			>
				<Typography
					style={{
						color: "#666",
						fontSize: 12,
						display: "flex",
						alignItems: "center",
						whiteSpace: "pre",
					}}
				>
					{"Each symbol ("}
					{
						<Pictogram
							svgProps={{
								style: {
									fontSize: 14,
									fill: "#666",
								},
							}}
							type="total"
						></Pictogram>
					}
					{") represents "}
					{
						<NumberAnimator
							number={parseFloat(
								formatSIFloat(maxValue / maxNumberOfPictograms)
							)}
							type="decimal"
						/>
					}
					{formatSIFloat(maxValue / maxNumberOfPictograms)
						.slice(-1)
						.replace("k", " thousand")
						.replace("M", " million") + " people"}
				</Typography>
			</Box>
		</Container>
	);
}

const MemoizedPictogramChart = React.memo(PictogramChart);

export default MemoizedPictogramChart;
