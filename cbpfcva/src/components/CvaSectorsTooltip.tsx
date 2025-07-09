import Popover from "@mui/material/Popover";
import Paper from "@mui/material/Paper";
import type { DatumCvaTypes } from "../utils/processdata";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import constants from "../utils/constants";
import type { List } from "../utils/makelists";
import BarChartRow from "./BarChartRow";
import { max } from "d3";
import colors from "../utils/colors";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

type CvaSectorsTooltipProps = {
	anchorEl: HTMLElement | null;
	handleClose: () => void;
	data: DatumCvaTypes | null;
	lists: List;
	cvaTypeClicked: number | null;
	handlePopoverCloseButton: () => void;
};

const { cvaPopoverWidth } = constants;

function CvaSectorsTooltip({
	anchorEl,
	handleClose,
	data,
	lists,
	cvaTypeClicked,
	handlePopoverCloseButton,
}: CvaSectorsTooltipProps) {
	const open = Boolean(anchorEl);

	const sortedData = data?.sectors.toSorted(
		(a, b) => b.allocations - a.allocations
	);

	const maxValue = sortedData
		? max(sortedData, d => Math.max(d.standard, d.reserve)) ?? 0
		: 0;

	return (
		data && (
			<Popover
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: "center",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "center",
					horizontal: "right",
				}}
				slotProps={{
					paper: {
						style: { marginTop: "-10px" },
					},
				}}
				style={{
					pointerEvents: cvaTypeClicked ? "all" : "none",
					transform: "translateX(-10px)",
				}}
				marginThreshold={8}
			>
				<Paper
					style={{
						padding: "10px",
						backgroundColor: "#fff",
						boxSizing: "border-box",
						border: cvaTypeClicked
							? `1px solid ${colors.unColor}`
							: "1px solid #888",
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
							style={{
								display: "flex",
								flexDirection: "row",
								width: "100%",
							}}
							mb={4}
						>
							<Box
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
							{cvaTypeClicked && (
								<Box
									style={{
										flexGrow: 0,
										alignSelf: "flex-start",
										alignItems: "center",
										justifyContent: "center",
										display: "flex",
										padding: 2,
									}}
								>
									<IconButton
										onClick={handlePopoverCloseButton}
										size="medium"
										aria-label="close"
										color="inherit"
										sx={{
											backgroundColor: "#eaeaea",
											"&:hover": {
												backgroundColor: "#d2d2d2",
											},
										}}
									>
										<CloseIcon
											sx={{
												fontSize: 24,
												"& path": {
													stroke: "#444",
													strokeWidth: 2,
												},
											}}
										/>
									</IconButton>
								</Box>
							)}
						</Box>
						<Box
							display={"flex"}
							flexDirection={"column"}
							width={"95%"}
							marginLeft={"3%"}
							alignItems={"center"}
							gap={1}
						>
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
											typeId={d.sector}
											valueA={d.standard}
											valueB={d.reserve}
											colorA={colors.standardColor}
											colorB={colors.reserveColor}
											maxValue={maxValue}
											listProperty={lists.sectors}
											chartType="sectors"
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
