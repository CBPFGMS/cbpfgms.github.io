import { useState } from "react";
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

const unColor = "#418fde";

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

	const [maxNumberOfPictograms, setMaxNumberOfPictograms] =
		useState<number>(0);

	console.log(maxNumberOfPictograms);

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
			>
				<Tooltip id="targeted-tooltip" />
				<Tooltip id="reached-tooltip" />
				<Pictogram
					svgProps={{
						style: {
							fontSize: 72,
							fill: unColor,
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
						style={{ color: unColor, border: "none" }}
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
						style={{
							marginTop: "-0.6em",
							fontSize: 18,
							color: "#444",
						}}
					>
						People Targeted
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
						variant="h3"
						fontWeight={500}
						style={{ color: unColor, border: "none" }}
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
					</Typography>
					<Typography
						style={{
							marginTop: "-0.6em",
							fontSize: 18,
							color: "#444",
						}}
					>
						People Reached
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
						setMaxNumberOfPictograms={setMaxNumberOfPictograms}
						maxValue={maxValue}
					/>
				))}
			</Box>
			<Box
				marginLeft={"3%"}
				marginTop={4}
			>
				{maxNumberOfPictograms > 0 && (
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
									formatSIFloat(
										maxValue / maxNumberOfPictograms
									)
								)}
							/>
						}
						{formatSIFloat(maxValue / maxNumberOfPictograms)
							.slice(-1)
							.replace("k", " thousand")
							.replace("M", " million") + " people"}
					</Typography>
				)}
			</Box>
		</Container>
	);
}

function capitalizeString(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export default PictogramChart;
