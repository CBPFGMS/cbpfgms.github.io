import Grid from "@mui/material/Unstable_Grid2";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import GradientPaper from "./GradientPaper";
import Divider from "@mui/material/Divider";
import { DatumSummary } from "../utils/processdatasummary";
import { DownloadStates, RefIds } from "./MainContainer";
import { ListObj } from "../utils/makelists";
import SummaryChart from "./SummaryChart";

type Ref = (node?: Element | null | undefined) => void;

type ChartsContainerProps = {
	dataSummary: DatumSummary[];
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	fundsList: ListObj;
	refIds: RefIds;
	summaryRef: Ref;
	pictogramRef: Ref;
};

function ChartsContainer({
	dataSummary,
	setClickedDownload,
	clickedDownload,
	fundsList,
	refIds,
	summaryRef,
	pictogramRef,
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
					<GradientPaper />
				</Box>
				<Grid
					container
					direction={"row"}
					spacing={1}
					xs={12}
					flexWrap={"nowrap"}
					mt={3}
					mb={3}
				>
					<Grid
						xs={6}
						ref={summaryRef}
						id={refIds.summaryRefId}
					>
						<SummaryChart
							dataSummary={dataSummary}
							clickedDownload={clickedDownload}
							setClickedDownload={setClickedDownload}
							//summaryDataDownload={summaryDataDownload}
							fundsList={fundsList}
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
						xs={6}
						ref={pictogramRef}
						id={refIds.pictogramRefId}
					>
						<Box
							display={"flex"}
							alignItems={"center"}
							justifyContent={"center"}
						>
							{/* <PictogramChart
								dataPictogram={dataPictogram}
								clickedDownload={clickedDownload}
								setClickedDownload={setClickedDownload}
								summaryDataDownload={summaryDataDownload}
								fundsList={apiData.lists.fundAbbreviatedNames}
							/> */}
						</Box>
					</Grid>
				</Grid>
			</Paper>
		</Grid>
	);
}

export default ChartsContainer;
