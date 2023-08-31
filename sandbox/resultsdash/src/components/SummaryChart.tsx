import { sum } from "d3-array";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import MoneyBag from "../assets/MoneyBag";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import Divider from "@mui/material/Divider";
import NumberAnimator from "./NumberAnimator";

const unColor = "#418fde";

function SummaryRow({
	year,
	allocations,
	projects,
	partners,
	last,
}: SummaryRowProps) {
	return (
		<>
			<Box
				style={{
					width: "100%",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Box
					style={{
						fontSize: "0.8rem",
						fontWeight: 900,
						color: unColor,
						marginLeft: "7%",
						marginBottom: "-0.4em",
					}}
				>
					{year}
				</Box>
				<Box
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-evenly",
					}}
				>
					{[allocations, projects, partners].map((d, i) => (
						<Box
							key={i}
							style={{
								display: "flex",
								flex: "0 24%",
								flexDirection: "column",
							}}
						>
							<Box
								style={{
									fontSize: "1.6rem",
									fontWeight: 500,
									color: "#222",
								}}
							>
								{d < 1e4
									? d
									: (i ? "" : "$") + formatSIFloat(d)}
							</Box>
							<Box
								style={{
									fontSize: "0.8rem",
									color: "#666",
									marginTop: "-0.4em",
								}}
							>
								{["Allocation", "Project", "Partner"][
									i
								].toUpperCase() + (d > 1 ? "S" : "")}
							</Box>
						</Box>
					))}
				</Box>
			</Box>
			{!last && <Divider style={{ width: "90%" }} />}
		</>
	);
}

function SummaryChart({ dataSummary, year }: SummaryChartProps) {
	const data = dataSummary.filter(d =>
		year !== null ? year.includes(d.year) : true
	);

	const total = sum(data, d => d.allocations);

	return (
		<Container disableGutters={true}>
			<Box
				display={"flex"}
				alignItems={"center"}
				justifyContent={"center"}
				gap={1}
				marginBottom={2}
			>
				<MoneyBag sx={{ fontSize: 60, fill: unColor }} />
				<Box
					display={"flex"}
					flexDirection={"column"}
					alignItems={"center"}
					justifyContent={"center"}
					gap={0}
				>
					<Typography
						variant="h3"
						fontWeight={500}
						style={{ color: unColor }}
					>
						{total < 1e3 ? (
							<NumberAnimator number={total} />
						) : (
							<span>
								<NumberAnimator
									number={parseFloat(formatSIFloat(total))}
								/>
								{formatSIFloat(total).slice(-1)}
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
						Allocations
					</Typography>
				</Box>
			</Box>
			<Box
				display={"flex"}
				flexDirection={"column"}
				alignItems={"center"}
				justifyContent={"center"}
				gap={1}
				marginLeft={4}
			>
				{data.map((d, i) => (
					<SummaryRow
						key={d.year}
						year={d.year}
						allocations={d.allocations}
						projects={d.projects}
						partners={d.partners}
						last={i === data.length - 1}
					/>
				))}
			</Box>
		</Container>
	);
}

export default SummaryChart;
