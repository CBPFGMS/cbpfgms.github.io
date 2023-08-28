import { useContext } from "react";
import DataContext from "../context/DataContext";
import processDataSummary from "../utils/processdatasummary";
import { sum } from "d3-array";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import MoneyBag from "../assets/MoneyBag";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";

const unColor = "#418fde";

function SummaryRow({ year, allocations, projects, partners }: SummaryData) {
	return (
		<Box
			style={{
				width: "100%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Box
				style={{
					fontSize: "0.7rem",
					fontWeight: 900,
					color: unColor,
					marginLeft: "7%",
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
							{(i ? "" : "$") + formatSIFloat(d)}
						</Box>
						<Box
							style={{
								fontSize: "0.8rem",
								color: "#666",
								marginTop: "-0.4em",
							}}
						>
							{["Allocations", "Projects", "Partners"][
								i
							].toUpperCase()}
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
}

function SummaryChart({
	reportYear,
	year,
	setYear,
	fund,
	allocationSource,
	allocationType,
}: SummaryChartProps) {
	const apiData = useContext(DataContext) as DataContext;
	const rawData = apiData.rawData;
	const data = processDataSummary({
		rawData,
		reportYear,
		fund,
		allocationSource,
		allocationType,
	});

	const total = sum(data, d => d.allocations);

	return (
		<Container disableGutters={true}>
			<Box
				display={"flex"}
				alignItems={"center"}
				justifyContent={"center"}
				gap={2}
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
						{formatSIFloat(total)}
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
				gap={2}
				marginLeft={4}
			>
				{data.map(d => (
					<SummaryRow
						key={d.year}
						year={d.year}
						allocations={d.allocations}
						projects={d.projects}
						partners={d.partners}
					/>
				))}
			</Box>
		</Container>
	);
}

export default SummaryChart;
