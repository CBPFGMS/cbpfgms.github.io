// import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
// import createPictogramChart from "../charts/createtopchart";
import Typography from "@mui/material/Typography";
import { Tooltip } from "react-tooltip";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import Pictogram from "../assets/Pictogram";
import Divider from "@mui/material/Divider";
import { format } from "d3-format";
import DownloadIcon from "./DownloadIcon";
import Container from "@mui/material/Container";

const unColor = "#418fde";

function PictogramChart({ dataPictogram }: PictogramChartProps) {
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

	// const svgContainer = useRef(null);

	// useEffect(() => {
	// 	createPictogramChart({
	// 		height,
	// 		dataSummary,
	// 		chartValue,
	// 		svgContainer,
	// 		year,
	// 		setYear,
	// 	});
	// // eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [dataSummary, chartValue]);

	return (
		<Container
			disableGutters={true}
			style={{
				position: "relative",
			}}
		>
			<DownloadIcon handleDownloadClick={() => console.log("download")} />
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
		</Container>
	);
}

export default PictogramChart;
