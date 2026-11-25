import React from "react";
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
import { constants } from "../utils/constants";
// import capitalizeString from "../utils/capitalizestring";
import type { TargetedAndReachedTotal } from "../utils/processdatatotalben";
import PercentageIcon from "./PercentageIcon";

type PictogramChartProps = {
	targetedAndReachedTotal: TargetedAndReachedTotal;
	attribution: number;
	donorName: string;
};

const { beneficiaryCategories } = constants;

function PictogramChart({
	targetedAndReachedTotal,
	attribution,
	donorName,
}: PictogramChartProps) {
	//using data from new APIs

	const totalTargeted = targetedAndReachedTotal.targeted.total;

	const totalReached = targetedAndReachedTotal.reached.total;

	const maxValue =
		max(
			beneficiaryCategories.map(type =>
				Math.max(
					targetedAndReachedTotal.targeted[type],
					targetedAndReachedTotal.reached[type],
				),
			),
		) || 0;

	const maxNumberOfPictograms = 22;

	return (
		<Container disableGutters={true}>
			<Box
				sx={{
					width: "90%",
					marginBottom: 2,
					justifyContent: "center",
					alignItems: "center",
					flexDirection: "row",
					display: "flex",
					gap: 2,
				}}
			>
				<PercentageIcon
					size={34}
					showTooltip={true}
					donorName={donorName}
					attribution={Math.round(attribution * 1000) / 10}
					plural={true}
				/>
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
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						gap: 0,
					}}
					data-tooltip-id="tooltip"
					data-tooltip-content={`People targeted: ${format(",.0f")(
						totalTargeted,
					)}`}
					data-tooltip-place="top"
				>
					<Typography
						variant="h3"
						sx={{
							color: colors.contrastColor,
							border: "none",
							fontWeight: 500,
						}}
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
										formatSIFloat(totalTargeted),
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
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						gap: 0,
					}}
					data-tooltip-id="tooltip"
					data-tooltip-content={`People reached: ${format(",.0f")(
						totalReached,
					)}`}
					data-tooltip-place="top"
				>
					<Typography
						noWrap={true}
						variant="h3"
						sx={{
							color: colors.unColor,
							border: "none",
							fontWeight: 500,
						}}
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
										formatSIFloat(totalReached),
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
							{"(" +
								(~~((totalReached * 100) / totalTargeted)
									? ""
									: "<")}
							<NumberAnimator
								number={
									~~((totalReached * 100) / totalTargeted) ||
									1
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
				sx={{
					display: "flex",
					flexDirection: "column",
					width: "95%",
					marginLeft: "3%",
					alignItems: "center",
					gap: 3,
					marginTop: 4,
				}}
			>
				<Box
					sx={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "flex-end",
						textAlign: "right",
						width: "100%",
						marginBottom: -2,
					}}
				>
					<Typography
						variant="body2"
						sx={{
							color: "#222",
							border: "none",
							fontStyle: "italic",
							letterSpacing: "-0.05em",
							fontSize: 12,
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
						targeted={targetedAndReachedTotal.targeted[type]}
						reached={targetedAndReachedTotal.reached[type]}
						maxNumberOfPictograms={maxNumberOfPictograms}
						maxValue={maxValue}
					/>
				))}
			</Box>
			<Box
				sx={{
					marginLeft: "3%",
					marginTop: 4,
					display: "flex",
					alignItems: "center",
				}}
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
								formatSIFloat(maxValue / maxNumberOfPictograms),
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
