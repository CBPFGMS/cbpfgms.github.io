import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import Pictogram from "../assets/Pictogram";
import Divider from "@mui/material/Divider";
import { format, max } from "d3";
import DownloadIcon from "./DownloadIcon";
import Container from "@mui/material/Container";
import PictogramRow from "./PictogramRow";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import colors from "../utils/colors";
//import downloadData from "../utils/downloaddata";
import { DatumPictogram } from "../utils/processdatasummary";
import { DownloadStates } from "./MainContainer";
import { ListObj } from "../utils/makelists";
import constants from "../utils/constants";
import capitalizeString from "../utils/capitalizestring";

type PictogramChartProps = {
	dataPictogram: DatumPictogram;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	//summaryDataDownload: ByDisabilityObj[];
	fundsList: ListObj;
};

const { beneficiaryCategories } = constants;

function PictogramChart({
	dataPictogram,
	clickedDownload,
	setClickedDownload,
}: //summaryDataDownload,
//fundsList,
PictogramChartProps) {
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

	// function handleDownloadClick() {
	// 	const data = summaryDataDownload.map(d => ({
	// 		"Report date": d.ReportApprovedDate,
	// 		Year: d.AllocationYear,
	// 		Fund: fundsList[d.PooledFundId],
	// 		"Targeted women": d.TargetedWomen || 0,
	// 		"Targeted men": d.TargetedMen || 0,
	// 		"Targeted girls": d.TargetedGirls || 0,
	// 		"Targeted boys": d.TargetedBoys || 0,
	// 		"Reached women": d.ReachedWomen || 0,
	// 		"Reached men": d.ReachedMen || 0,
	// 		"Reached girls": d.ReachedGirls || 0,
	// 		"Reached boys": d.ReachedBoys || 0,
	// 	}));
	// 	downloadData<(typeof data)[number]>(data, "people_targeted_reached");
	// }

	return (
		<Container
			disableGutters={true}
			style={{
				position: "relative",
			}}
		>
			<DownloadIcon
				//handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type="pictogram"
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
						}}
					>
						People Targeted
						<AdsClickIcon
							style={{
								fontSize: 18,
								marginLeft: 4,
								color: "#777",
								opacity: 0.6,
								marginBottom: "-3px",
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
						}}
					>
						People Reached
						<DoneIcon
							style={{
								fontSize: 18,
								marginLeft: 4,
								color: "#777",
								opacity: 0.6,
								marginBottom: "-2px",
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
			>
				<Typography style={{ color: "#666", fontSize: 12 }}>
					{"Each symbol ("}
					{
						<Pictogram
							svgProps={{
								style: {
									fontSize: 14,
									fill: "#666",
									marginBottom: "-3px",
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

export default PictogramChart;
