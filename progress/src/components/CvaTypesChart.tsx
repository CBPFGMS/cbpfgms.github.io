import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { List } from "../utils/makelists";
import { DatumCva } from "../utils/processdatasummary";
import BarChartRow from "./BarChartRow";
import { CvaChartModes } from "./CvaChart";
import { max } from "d3";

type CvaTypesChartProps = {
	dataCva: DatumCva[];
	cvaChartMode: CvaChartModes;
	lists: List;
};

function CvaTypesChart({ dataCva, cvaChartMode, lists }: CvaTypesChartProps) {
	const [firstTime, setFirstTime] = useState<boolean>(true);

	function handleFirstTime() {
		setFirstTime(false);
	}

	const property = cvaChartMode === "allocations" ? "Allocations" : "People";
	const maxValue =
		max(dataCva, d =>
			Math.max(d[`targeted${property}`], d[`reached${property}`])
		) ?? 0;

	return (
		<Box
			style={{
				width: "100%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Box
				display={"flex"}
				flexDirection={"row"}
				alignItems={"center"}
				gap={1}
			>
				<Typography
					style={{
						marginLeft: "28.6%",
					}}
				>
					CVA Types
				</Typography>
				{firstTime && (
					<Typography style={{ fontSize: "0.8rem", color: "#555" }}>
						(hover for sector details)
					</Typography>
				)}
			</Box>
			<Box
				display={"flex"}
				flexDirection={"column"}
				width={"95%"}
				marginLeft={"3%"}
				alignItems={"center"}
				gap={2}
			>
				<Box
					display={"flex"}
					flexDirection={"row"}
					width={"100%"}
				>
					<Box flex={"0 88%"} />
					<Box
						mb={-2}
						style={{
							display: "flex",
							flex: "0 12%",
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "center",
							textAlign: "center",
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
				</Box>
				{dataCva.map(d => (
					<BarChartRow
						key={d.cvaType}
						type={d.cvaType}
						targeted={
							cvaChartMode === "allocations"
								? d.targetedAllocations
								: d.targetedPeople
						}
						reached={
							cvaChartMode === "allocations"
								? d.reachedAllocations
								: d.reachedPeople
						}
						maxValue={maxValue}
						list={lists.cvaTypeNames}
						chartType="cash"
						fromCva={true}
						isAllocation={cvaChartMode === "allocations"}
					/>
				))}
			</Box>
		</Box>
	);
}

const MemoisedCvaTypesChart = React.memo(CvaTypesChart);

export default MemoisedCvaTypesChart;
