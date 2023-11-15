import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import createDonut from "../charts/createdonut";
import describeYears from "../utils/describeyears";
import { scaleOrdinal } from "d3-scale";
import colors from "../utils/colors";

const donutBoxSize = 134;

function ApprovedChart({
	approvedData,
	year,
	dataSummary,
	reportYear,
	allocatedTotals,
}: ApprovedChartProps) {
	const total = approvedData.reduce((acc: number, curr: ApprovedSummary) => {
		if (year.includes(curr.year)) {
			acc += curr.approved;
		}
		return acc;
	}, 0);

	const allocatedSelected = dataSummary.reduce(
		(acc: number, curr: SummaryData) => {
			if (year.includes(curr.year)) acc += curr.allocations;
			return acc;
		},
		0
	);

	let allocatedTotal: number = 0;

	for (const key in allocatedTotals) {
		if (year.includes(+key)) {
			allocatedTotal += allocatedTotals[key];
		}
	}

	const donutData: DonutData = [
		{ type: "selected", value: allocatedSelected },
		{ type: "allocated", value: allocatedTotal - allocatedSelected },
		{ type: "underImplementation", value: total - allocatedTotal },
	];

	const svgContainer = useRef(null);

	const colorScale = scaleOrdinal<DonutTypes, string>()
		.domain(donutData.map(d => d.type))
		.range([
			colors.contrastColorDarker,
			colors.contrastColorLighter,
			"#ccc",
		]);

	useEffect(() => {
		createDonut({
			size: donutBoxSize,
			svgContainer,
			donutData,
			colorScale,
			reportYear,
		});
	});

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
					minWidth: "280px",
				}}
			>
				<Typography
					variant="body2"
					fontSize={14}
					style={{ textAlign: "center" }}
				>
					For Allocation Year
					{year.length > 1 ? "s " : " "}
					<span style={{ fontWeight: "bold" }}>
						{describeYears(year)}
					</span>
				</Typography>
				<svg
					height={donutBoxSize}
					width={donutBoxSize}
					ref={svgContainer}
				></svg>
				<BulletPoint
					color={colorScale("selected")}
					value={allocatedSelected}
					text={"Reports approved in " + reportYear[0]}
				/>
				<BulletPoint
					color={colorScale("allocated")}
					value={allocatedTotal - allocatedSelected}
					text="Reports approved in other years"
				/>
				<BulletPoint
					color={colorScale("underImplementation")}
					value={total - allocatedTotal}
					text={"Under Implementation"}
				/>
			</Box>
		</Paper>
	);
}

function BulletPoint({
	color,
	value,
	text,
}: {
	color: string;
	value: number;
	text: string;
}) {
	return (
		<Typography
			variant="body2"
			style={{ lineHeight: 1.2, fontSize: 12 }}
		>
			<span style={{ color: color, fontSize: 16 }}>{"\u25CF "}</span>
			<span style={{ color: "#444" }}>{text}: </span>
			{value < 1e3 ? (
				<NumberAnimator number={value} />
			) : (
				<span style={{ fontWeight: "bold" }}>
					<NumberAnimator number={parseFloat(formatSIFloat(value))} />
					{formatSIFloat(value).slice(-1)}
				</span>
			)}
		</Typography>
	);
}

export default ApprovedChart;
