import { useContext, useState } from "react";
import DataContext from "../context/DataContext";
import Grid from "@mui/material/Unstable_Grid2";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import YearSelector from "./YearSelector";
import Selectors from "./Selectors";
import SummaryChart from "./SummaryChart";
import GradientPaper from "./GradientPaper";
import Divider from "@mui/material/Divider";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import processDataSummary from "../utils/processdatasummary";
import TopChart from "./TopChart";

function MainContainer() {
	const apiData = useContext(DataContext) as DataContext;
	const rawData = apiData.rawData;

	const lastYear = [...apiData.inDataLists.reportYears].sort(
		(a, b) => b - a
	)[0];

	const [reportYear, setReportYear] = useState<number[]>([lastYear]);
	const [year, setYear] = useState<number[] | null>(null);
	const [allocationType, setAllocationType] = useState<number[]>([
		...apiData.inDataLists.allocationTypes,
	]);
	const [fund, setFund] = useState<number[]>([...apiData.inDataLists.funds]);
	const [allocationSource, setAllocationSource] = useState<number[]>([
		...apiData.inDataLists.allocationSources,
	]);

	const dataSummary = processDataSummary({
		rawData,
		reportYear,
		fund,
		allocationSource,
		allocationType,
	});

	return (
		<Container
			disableGutters={true}
			style={{
				paddingLeft: "12px",
				paddingRight: "12px",
			}}
		>
			<Grid
				container
				spacing={2}
			>
				<Paper
					elevation={0}
					style={{
						width: "100%",
						paddingTop: "1em",
						paddingBottom: "1em",
						backgroundColor: "#f5f8ff",
						borderRadius: "8px",
						position: "relative",
						overflow: "hidden",
					}}
				>
					<GradientPaper />
					<Grid
						xs={12}
						mb={6}
					>
						<YearSelector
							reportYear={reportYear}
							setReportYear={setReportYear}
							reportYears={apiData.inDataLists.reportYears}
						/>
					</Grid>
					<Grid xs={12}>
						<Selectors
							fund={fund}
							setFund={setFund}
							allocationSource={allocationSource}
							setAllocationSource={setAllocationSource}
							allocationType={allocationType}
							setAllocationType={setAllocationType}
						/>
					</Grid>
				</Paper>
			</Grid>
			<Grid
				container
				spacing={2}
				mt={6}
			>
				<Paper
					elevation={0}
					style={{
						width: "100%",
						paddingTop: "2em",
						paddingBottom: "1em",
						backgroundColor: "#f5f8ff",
						borderRadius: "6px",
						position: "relative",
						overflow: "hidden",
					}}
				>
					<GradientPaper />
					<Grid xs={12}>
						<Box
							display={"flex"}
							alignItems={"center"}
							justifyContent={"center"}
						>
							<TopChart
								year={year}
								dataSummary={dataSummary}
								setYear={setYear}
							/>
						</Box>
					</Grid>
					<Grid
						container
						direction={"row"}
						spacing={1}
						xs={12}
						flexWrap={"nowrap"}
					>
						<Grid xs={6}>
							<SummaryChart
								dataSummary={dataSummary}
								year={year}
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
						<Grid xs={6}>
							<Box
								display={"flex"}
								alignItems={"center"}
								justifyContent={"center"}
							>
								<Typography>Chart 02</Typography>
							</Box>
						</Grid>
					</Grid>
				</Paper>
			</Grid>
		</Container>
	);
}

export default MainContainer;
