import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import GradientPaper from "./GradientPaper";
import Divider from "@mui/material/Divider";
import type { List } from "../utils/makelists";
import PictogramChart from "./PictogramChart";
import BarChart from "./BarChart";
import type { DatumBarChart } from "../utils/processdatabarchart";
import type { TargetedAndReachedTotal } from "../utils/processdatatotalben";

type ChartsContainerProps = {
	targetedAndReachedTotal: TargetedAndReachedTotal;
	dataSector: DatumBarChart[];
	dataOrganization: DatumBarChart[];
	lists: List;
	attribution: number;
	donorName: string;
};

function ChartsContainer({
	targetedAndReachedTotal,
	dataSector,
	dataOrganization,
	lists,
	attribution,
	donorName,
}: ChartsContainerProps) {
	return (
		<Grid
			container
			spacing={2}
		>
			<Paper
				elevation={0}
				style={{
					width: "100%",
					padding: "1em",
					backgroundColor: "#f5f8ff",
					borderRadius: "8px",
					position: "relative",
				}}
			>
				<Box
					style={{
						width: "100%",
						height: "100%",
						overflow: "hidden",
						position: "absolute",
						borderRadius: "8px",
						boxSizing: "border-box",
						top: "0px",
						left: "0px",
						pointerEvents: "none",
					}}
				>
					<GradientPaper color={"#999999"} />
				</Box>
				<Grid
					container
					direction={"row"}
					spacing={1}
					size={12}
					sx={{
						flexWrap: "nowrap",
						marginTop: "3",
						marginBottom: "3",
					}}
				>
					<Grid
						size={6}
						sx={{ padding: "1.5em" }}
					>
						<PictogramChart
							targetedAndReachedTotal={targetedAndReachedTotal}
							attribution={attribution}
							donorName={donorName}
						/>
					</Grid>
					<Divider
						orientation="vertical"
						flexItem
						style={{
							borderLeft: "3px dotted #ccc",
							borderRight: "none",
						}}
					/>
					<Grid
						size={6}
						sx={{ padding: "1.5em" }}
					>
						<BarChart
							originalData={dataOrganization}
							lists={lists}
							title={
								"People targeted and reached by organization"
							}
							chartType={"organizations"}
							attribution={attribution}
							donorName={donorName}
						/>
					</Grid>
				</Grid>
				<Divider
					orientation="horizontal"
					flexItem
					style={{
						borderTop: "3px dotted #ccc",
						borderBottom: "none",
						width: "96%",
						marginLeft: "2%",
					}}
				/>
				<Grid
					container
					direction={"row"}
					spacing={1}
					size={12}
					sx={{
						flexWrap: "nowrap",
						marginTop: "3",
						marginBottom: "3",
						justifyContent: "center",
					}}
				>
					<Grid
						size={8}
						sx={{ padding: "1.5em" }}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<BarChart
								originalData={dataSector}
								lists={lists}
								title={"People targeted and reached by sector"}
								chartType={"sectors"}
								attribution={attribution}
								donorName={donorName}
							/>
						</Box>
					</Grid>
				</Grid>
			</Paper>
		</Grid>
	);
}

export default ChartsContainer;
