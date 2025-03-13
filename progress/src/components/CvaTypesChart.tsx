import React, { useState, MouseEvent } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { List } from "../utils/makelists";
import { DatumCva } from "../utils/processdatasummary";
import BarChartRow from "./BarChartRow";
import { CvaChartModes } from "./CvaChart";
import { max } from "d3";
import CvaSectorsTooltip from "./CvaSectorsTooltip";

type CvaTypesChartProps = {
	dataCva: DatumCva[];
	cvaChartMode: CvaChartModes;
	lists: List;
	totalValue: number;
};

function CvaTypesChart({
	dataCva,
	cvaChartMode,
	lists,
	totalValue,
}: CvaTypesChartProps) {
	const [firstTime, setFirstTime] = useState<boolean>(true);
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [tooltipData, setTooltipData] = useState<DatumCva | null>(null);

	function handleFirstTime() {
		setFirstTime(false);
	}

	function handleBarHover(event: MouseEvent<HTMLElement>, data: DatumCva) {
		setAnchorEl(event.currentTarget);
		setTooltipData(data);
	}

	function handleMouseLeave() {
		setAnchorEl(null);
		setTooltipData(null);
	}

	const property = cvaChartMode === "allocations" ? "Allocations" : "People";
	const maxValue =
		max(dataCva, d =>
			Math.max(d[`targeted${property}`], d[`reached${property}`])
		) ?? 0;

	const sortedData = dataCva.toSorted(
		(a, b) => b[`reached${property}`] - a[`reached${property}`]
	);

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
				mt={2}
			>
				<Box
					display={"flex"}
					flexDirection={"row"}
					width={"100%"}
					mb={-1}
				>
					<Box
						display={"flex"}
						flex={"0 28%"}
						justifyContent={"flex-end"}
						alignItems={"center"}
						style={{
							textAlign: "center",
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
							% of total
							<br />
							targeted CVA
						</Typography>
					</Box>
					<Box flex={"0 60%"} />
					<Box
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
				{sortedData.map(d => (
					<Box
						key={d.cvaType}
						onMouseEnter={e => {
							handleBarHover(e, d);
							handleFirstTime();
						}}
						onMouseLeave={handleMouseLeave}
						style={{
							width: "100%",
							display: "flex",
						}}
					>
						<BarChartRow
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
							totalCvaPercentage={
								~~(
									(100 * d[`targeted${property}`]) /
									totalValue
								)
							}
						/>
					</Box>
				))}
			</Box>
			<CvaSectorsTooltip
				anchorEl={anchorEl}
				handleClose={handleMouseLeave}
				data={tooltipData}
				lists={lists}
				cvaChartMode={cvaChartMode}
			/>
		</Box>
	);
}

const MemoisedCvaTypesChart = React.memo(CvaTypesChart);

export default MemoisedCvaTypesChart;
