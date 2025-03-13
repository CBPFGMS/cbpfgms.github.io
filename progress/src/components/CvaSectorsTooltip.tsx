import Popover from "@mui/material/Popover";
import Paper from "@mui/material/Paper";
import { DatumCva } from "../utils/processdatasummary";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import constants from "../utils/constants";
import { List } from "../utils/makelists";
import BarChartRow from "./BarChartRow";
import { CvaChartModes } from "./CvaChart";
import { max } from "d3";

type CvaSectorsTooltipProps = {
	anchorEl: HTMLElement | null;
	handleClose: () => void;
	data: DatumCva | null;
	lists: List;
	cvaChartMode: CvaChartModes;
};

const { cvaPopoverWidth } = constants;

function CvaSectorsTooltip({
	anchorEl,
	handleClose,
	data,
	lists,
	cvaChartMode,
}: CvaSectorsTooltipProps) {
	const open = Boolean(anchorEl);

	const property = cvaChartMode === "allocations" ? "Allocations" : "People";

	const sortedData = data?.sectorData.toSorted(
		(a, b) => b[`reached${property}`] - a[`reached${property}`]
	);

	const maxValue = sortedData
		? max(sortedData, d =>
				Math.max(d[`targeted${property}`], d[`reached${property}`])
		  ) ?? 0
		: 0;

	return (
		data && (
			<Popover
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: "top",
					horizontal: "center",
				}}
				transformOrigin={{
					vertical: "bottom",
					horizontal: "center",
				}}
				slotProps={{
					paper: {
						// onMouseEnter: e => {
						// 	e.stopPropagation();
						// },
						// style: { pointerEvents: "auto" },
						style: { marginTop: "-10px" },
					},
				}}
				style={{ pointerEvents: "none" }}
				marginThreshold={8}
			>
				<Paper
					style={{
						padding: "10px",
						backgroundColor: "#f9f9f9",
					}}
				>
					<Box
						style={{
							width: cvaPopoverWidth,
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Box
							mb={2}
							style={{
								width: "100%",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Typography>Sectors</Typography>
							<Typography
								variant="caption"
								style={{ color: "#555" }}
							>
								{lists.cvaTypeNames[data.cvaType].trimEnd()}
							</Typography>
						</Box>
						<Box
							display={"flex"}
							flexDirection={"column"}
							width={"95%"}
							marginLeft={"3%"}
							alignItems={"center"}
							gap={1}
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
							{sortedData &&
								sortedData.map(d => (
									<Box
										key={d.sector}
										style={{
											width: "100%",
											display: "flex",
										}}
									>
										<BarChartRow
											type={d.sector}
											targeted={d[`targeted${property}`]}
											reached={d[`reached${property}`]}
											maxValue={maxValue}
											list={lists.sectors}
											chartType="sectors"
											fromCva={true}
											isAllocation={
												cvaChartMode === "allocations"
											}
										/>
									</Box>
								))}
						</Box>
					</Box>
				</Paper>
			</Popover>
		)
	);
}

export default CvaSectorsTooltip;
