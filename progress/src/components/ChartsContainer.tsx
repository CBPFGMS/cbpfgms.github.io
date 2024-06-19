import Grid from "@mui/material/Unstable_Grid2";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import GradientPaper from "./GradientPaper";
import Divider from "@mui/material/Divider";
import { DatumSummary, DatumPictogram } from "../utils/processdatasummary";
import {
	DownloadStates,
	RefIds,
	ImplementationStatuses,
} from "./MainContainer";
import { List } from "../utils/makelists";
import SummaryChart from "./SummaryChart";
import PictogramChart from "./PictogramChart";
import BarChart from "./BarChart";
import { DatumBarChart } from "../utils/processdatabarchart";
import { DataLeadership } from "../utils/processdataorganizationleadership";
import LeadershipChart from "./Leadership";

type Ref = (node?: Element | null | undefined) => void;

type ChartsContainerProps = {
	dataSummary: DatumSummary[];
	dataPictogram: DatumPictogram;
	dataBeneficiaryByType: DatumBarChart[];
	dataSector: DatumBarChart[];
	dataOrganization: DatumBarChart[];
	dataLeadership: DataLeadership;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	lists: List;
	refIds: RefIds;
	summaryRef: Ref;
	pictogramRef: Ref;
	beneficiaryTypesRef: Ref;
	sectorsRef: Ref;
	organizationsRef: Ref;
	leadershipRef: Ref;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationsStatus: ImplementationStatuses[];
};

function ChartsContainer({
	dataSummary,
	dataPictogram,
	dataBeneficiaryByType,
	dataSector,
	dataOrganization,
	dataLeadership,
	setClickedDownload,
	clickedDownload,
	lists,
	refIds,
	summaryRef,
	pictogramRef,
	beneficiaryTypesRef,
	sectorsRef,
	organizationsRef,
	leadershipRef,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationsStatus,
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
							year={year}
							fund={fund}
							allocationSource={allocationSource}
							allocationType={allocationType}
							implementationStatus={implementationsStatus}
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
						<PictogramChart
							dataPictogram={dataPictogram}
							clickedDownload={clickedDownload}
							setClickedDownload={setClickedDownload}
							year={year}
							fund={fund}
							allocationSource={allocationSource}
							allocationType={allocationType}
							implementationStatus={implementationsStatus}
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
					xs={12}
					flexWrap={"nowrap"}
					mt={3}
					mb={3}
				>
					<Grid
						xs={6}
						ref={beneficiaryTypesRef}
						id={refIds.beneficiaryTypesRefId}
					>
						<BarChart
							originalData={dataBeneficiaryByType}
							lists={lists}
							clickedDownload={clickedDownload}
							setClickedDownload={setClickedDownload}
							title={"People targeted and reached by type"}
							chartType={"beneficiaryTypes"}
							year={year}
							fund={fund}
							allocationSource={allocationSource}
							allocationType={allocationType}
							implementationStatus={implementationsStatus}
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
						ref={organizationsRef}
						id={refIds.organizationsRefId}
					>
						<BarChart
							originalData={dataOrganization}
							lists={lists}
							clickedDownload={clickedDownload}
							setClickedDownload={setClickedDownload}
							title={
								"People targeted and reached by organization"
							}
							chartType={"organizations"}
							year={year}
							fund={fund}
							allocationSource={allocationSource}
							allocationType={allocationType}
							implementationStatus={implementationsStatus}
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
					justifyContent={"center"}
					spacing={1}
					xs={12}
					flexWrap={"nowrap"}
					mt={3}
					mb={3}
				>
					<Grid
						xs={8}
						ref={sectorsRef}
						id={refIds.sectorsRefId}
					>
						<Box
							display={"flex"}
							alignItems={"center"}
							justifyContent={"center"}
						>
							<BarChart
								originalData={dataSector}
								lists={lists}
								clickedDownload={clickedDownload}
								setClickedDownload={setClickedDownload}
								title={"People targeted and reached by sector"}
								chartType={"sectors"}
								year={year}
								fund={fund}
								allocationSource={allocationSource}
								allocationType={allocationType}
								implementationStatus={implementationsStatus}
							/>
						</Box>
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
					justifyContent={"center"}
					spacing={1}
					xs={12}
					flexWrap={"nowrap"}
					mt={3}
					mb={3}
				>
					<Grid
						xs={8}
						ref={leadershipRef}
						id={refIds.leadershipRefId}
					>
						<Box
							display={"flex"}
							alignItems={"center"}
							justifyContent={"center"}
						>
							<LeadershipChart
								dataLeadership={dataLeadership}
								clickedDownload={clickedDownload}
								setClickedDownload={setClickedDownload}
								year={year}
								fund={fund}
								allocationSource={allocationSource}
								allocationType={allocationType}
								implementationStatus={implementationsStatus}
							/>
						</Box>
					</Grid>
				</Grid>
			</Paper>
		</Grid>
	);
}

export default ChartsContainer;
