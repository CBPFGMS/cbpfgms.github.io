import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CvaChartModes, CvaGoal } from "./CvaChart";
import NumberAnimator from "./NumberAnimator";
import formatSIFloat from "../utils/formatsi";
import colors from "../utils/colors";
import capitalizeString from "../utils/capitalizestring";
import CvaDonut from "./CvaDonut";
import { format } from "d3";

type CvaDonutsProps = {
	totalValue: number;
	cvaValue: number;
	cvaMode: CvaChartModes;
	cvaGoal: CvaGoal;
};

function CvaDonuts({ totalValue, cvaValue, cvaMode, cvaGoal }: CvaDonutsProps) {
	return (
		<Box
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				justifyContent: "flex-start",
				alignItems: "center",
				flexDirection: "column",
			}}
		>
			<Typography
				style={{
					fontSize: "0.8rem",
					fontStyle: "italic",
					color: "#555",
					padding: "0.5em",
					alignSelf:
						cvaGoal === "targeted" ? "flex-end" : "flex-start",
				}}
			>
				{cvaMode === "allocations" ? "$USD" : "People"}{" "}
				{capitalizeString(cvaGoal)}
			</Typography>
			<Box
				mt={1}
				display={"flex"}
				justifyContent={"center"}
				alignItems={"center"}
				flexDirection={"column"}
				style={{ height: "100%", width: "100%" }}
				data-tooltip-id="tooltip"
				data-tooltip-html={`<div style='text-align:center;'>CVA ${cvaGoal} ${cvaMode}: ${
					cvaMode === "allocations" ? "$" : ""
				}${format(",.0f")(cvaValue)}<br />(${
					~~((cvaValue * 10000) / totalValue) / 100
				}% of ${cvaMode === "allocations" ? "$" : ""}${format(",.0f")(
					totalValue
				)})</div>`}
				data-tooltip-place="top"
			>
				<Typography
					style={{
						fontSize: "1rem",
						marginBottom: "0.5em",
					}}
				>
					{"Total "}
					{cvaMode === "allocations" ? "Allocations" : "People"}
					{": "}
					<span
						style={{
							fontWeight: 500,
							fontSize: "1.2rem",
							color:
								cvaGoal === "targeted"
									? colors.contrastColor
									: colors.unColor,
						}}
					>
						{cvaMode === "allocations" ? "$" : ""}
						{totalValue < 1e3 ? (
							<NumberAnimator
								number={totalValue}
								type="decimal"
							/>
						) : (
							<>
								<NumberAnimator
									number={parseFloat(
										formatSIFloat(totalValue)
									)}
									type="decimal"
								/>
								{formatSIFloat(totalValue).slice(-1)}
							</>
						)}
					</span>
				</Typography>
				<CvaDonut
					totalColor={
						cvaGoal === "targeted"
							? colors.contrastColorLighter
							: colors.unColorLighter
					}
					totalSlice={totalValue}
					cvaColor={
						cvaGoal === "targeted"
							? colors.contrastColorDarker
							: colors.unColorDarker
					}
					cvaSlice={cvaValue}
				/>
				<Typography
					style={{
						fontSize: "1rem",
						marginTop: "0.5em",
					}}
				>
					{"CVA "}
					{cvaMode === "allocations" ? "Allocations" : "People"}
					{": "}
					<span
						style={{
							fontWeight: 500,
							fontSize: "1.2rem",
							color:
								cvaGoal === "targeted"
									? colors.contrastColorDarker
									: colors.unColorDarker,
						}}
					>
						{cvaMode === "allocations" ? "$" : ""}
						{cvaValue < 1e3 ? (
							<NumberAnimator
								number={cvaValue}
								type="decimal"
							/>
						) : (
							<>
								<NumberAnimator
									number={parseFloat(formatSIFloat(cvaValue))}
									type="decimal"
								/>
								{formatSIFloat(cvaValue).slice(-1)}
							</>
						)}
					</span>
				</Typography>
			</Box>
		</Box>
	);
}

const MemoisedCvaDonuts = React.memo(CvaDonuts);

export default MemoisedCvaDonuts;
