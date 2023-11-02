import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import createDonut from "../charts/createdonut";

const donutBoxSize = 160;

function ApprovedChart({
	approvedData,
	year,
	dataSummary,
	reportYear,
}: ApprovedChartProps) {
	const total = approvedData.reduce(
		(acc: ApprovedAndUnder, curr: ApprovedAllocationsByYear) => {
			if (year.includes(curr.year)) {
				acc.approved += curr.approved;
				acc.underApproval += curr.underApproval;
			}
			return acc;
		},
		{ approved: 0, underApproval: 0 }
	);

	const allocatedSelected = dataSummary.reduce(
		(acc: number, curr: SummaryData) => {
			if (year.includes(curr.year)) acc += curr.allocations;
			return acc;
		},
		0
	);

	const svgContainer = useRef(null);

	useEffect(() => {
		createDonut({
			size: donutBoxSize,
			svgContainer,
			total,
			allocatedSelected,
		});
	}, [total, year]);

	return (
		<Paper
			elevation={1}
			style={{
				padding: "12px",
				backgroundColor: "#ffffff",
			}}
		>
			<Box
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					maxWidth: "330px",
				}}
			>
				<Typography
					variant="body2"
					fontSize={12}
					style={{ textAlign: "center" }}
				>
					How the selected year
					{year.length > 1 ? "s" : ` (${year[0]})`} in the Report Year{" "}
					{reportYear[0]} compare{year.length > 1 ? "" : "s"} to the
					same year
					{year.length > 1 ? "s" : ` (${year[0]})`} in other Report
					Years
				</Typography>
				<svg
					height={donutBoxSize}
					width={donutBoxSize}
					ref={svgContainer}
				></svg>
				<Typography
					variant="body2"
					style={{ lineHeight: 1.2, fontSize: 12 }}
				>
					<span style={{ color: "#444" }}>
						Total (in all report years):{" "}
					</span>
					{total.approved + total.underApproval < 1e3 ? (
						<NumberAnimator
							number={total.approved + total.underApproval}
						/>
					) : (
						<span style={{ fontWeight: "bold" }}>
							<NumberAnimator
								number={parseFloat(
									formatSIFloat(
										total.approved + total.underApproval
									)
								)}
							/>
							{formatSIFloat(
								total.approved + total.underApproval
							).slice(-1)}
						</span>
					)}
				</Typography>
				<Typography
					variant="body2"
					style={{ lineHeight: 1.2, fontSize: 12 }}
				>
					<span style={{ color: "#444" }}>
						Approved (in all report years):{" "}
					</span>
					{total.approved < 1e3 ? (
						<NumberAnimator
							number={total.approved + total.underApproval}
						/>
					) : (
						<span style={{ fontWeight: "bold" }}>
							<NumberAnimator
								number={parseFloat(
									formatSIFloat(total.approved)
								)}
							/>
							{formatSIFloat(total.approved).slice(-1)}
						</span>
					)}
				</Typography>
			</Box>
		</Paper>
	);
}

export default ApprovedChart;
