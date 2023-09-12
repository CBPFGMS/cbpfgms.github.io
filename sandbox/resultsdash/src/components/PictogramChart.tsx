import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Tooltip } from "react-tooltip";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import Pictogram from "../assets/Pictogram";
import Divider from "@mui/material/Divider";
import { format } from "d3-format";
import DownloadIcon from "./DownloadIcon";
import Container from "@mui/material/Container";
import PictogramRow from "./PictogramRow";
import { max } from "d3-array";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import colors from "../utils/colors";

function PictogramChart({
	dataPictogram,
	clickedDownload,
	setClickedDownload,
}: PictogramChartProps) {
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

	const beneficiaryTypesArray: PictogramTypes[] = [
		"women",
		"men",
		"girls",
		"boys",
	];

	const maxValue = max(Object.values(dataPictogram)) as number;
	const maxNumberOfPictograms = 22;

	return (
		<Container
			disableGutters={true}
			style={{
				position: "relative",
			}}
		>
			<DownloadIcon
				handleDownloadClick={() => console.log("download")}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type="pictogram"
			/>
			<Box
				display={"flex"}
				flexDirection={"row"}
				alignItems={"center"}
				justifyContent={"center"}
				gap={3}
				marginBottom={2}
				width={"90%"}
			>
				<Tooltip id="targeted-tooltip" />
				<Tooltip id="reached-tooltip" />
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
					data-tooltip-id="targeted-tooltip"
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
							<NumberAnimator number={totalTargeted} />
						) : (
							<span>
								<NumberAnimator
									number={parseFloat(
										formatSIFloat(totalTargeted)
									)}
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
							color: "#444",
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
					data-tooltip-id="reached-tooltip"
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
							<NumberAnimator number={totalReached} />
						) : (
							<span>
								<NumberAnimator
									number={parseFloat(
										formatSIFloat(totalReached)
									)}
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
							/>
							{"%)"}
						</span>
					</Typography>
					<Typography
						noWrap={true}
						style={{
							marginTop: "-0.6em",
							fontSize: 18,
							color: "#444",
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
				{beneficiaryTypesArray.map(type => (
					<PictogramRow
						key={type}
						type={type}
						targeted={
							dataPictogram[
								("targeted" +
									capitalizeString(
										type
									)) as keyof PictogramData
							]
						}
						reached={
							dataPictogram[
								("reached" +
									capitalizeString(
										type
									)) as keyof PictogramData
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

function capitalizeString(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export default PictogramChart;
