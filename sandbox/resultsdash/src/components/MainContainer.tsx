import { useContext, useEffect, useState } from "react";
import DataContext from "../context/DataContext";
import Grid from "@mui/material/Unstable_Grid2";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import YearSelector from "./YearSelector";
import Selectors from "./Selectors";
import SummaryChart from "./SummaryChart";
import GradientPaper from "./GradientPaper";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import processDataSummary from "../utils/processdatasummary";
import TopChart from "./TopChart";
import PictogramChart from "./PictogramChart";
import { Typography } from "@mui/material";

const downloadStates: DownloadStates = {
	summary: false,
	pictogram: false,
};

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

	const [clickedDownload, setClickedDownload] =
		useState<DownloadStates>(downloadStates);

	const { dataSummary, dataPictogram, inSelectionData } = processDataSummary({
		rawData,
		reportYear,
		fund,
		allocationSource,
		allocationType,
		year,
	});

	useEffect(() => {
		setClickedDownload(downloadStates);
	}, [reportYear, fund, allocationSource, allocationType]);

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
				justifyContent={"center"}
			>
				<Grid
					xs={12}
					mb={2}
					display={"flex"}
					alignItems={"center"}
					justifyContent={"center"}
				>
					<YearSelector
						reportYear={reportYear}
						setReportYear={setReportYear}
						reportYears={apiData.inDataLists.reportYears}
						setYear={setYear}
					/>
					<Typography
						variant={"h4"}
						style={{
							fontFamily: "Montserrat",
							fontSize: "40px",
							fontWeight: 700,
							marginLeft: "1em",
						}}
					>
						Results Dashboard
					</Typography>
				</Grid>
				<Grid
					xs={8}
					mb={3}
				>
					<Typography
						variant="body1"
						style={{
							fontFamily: "Montserrat",
							fontSize: "14px",
							textAlign: "center",
						}}
					>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit.
						Sed ullamcorper, nisl quis tincidunt aliquam, nunc nibh
						ullamcorper nisi, quis tincidunt elit nunc quis nunc.
						Sed.
					</Typography>
				</Grid>
			</Grid>
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
						overflow: "hidden",
					}}
				>
					<GradientPaper />
					<Grid xs={12}>
						<Selectors
							fund={fund}
							setFund={setFund}
							allocationSource={allocationSource}
							setAllocationSource={setAllocationSource}
							allocationType={allocationType}
							setAllocationType={setAllocationType}
							inSelectionData={inSelectionData}
						/>
					</Grid>
					<Grid
						xs={12}
						display={"flex"}
						justifyContent={"flex-start"}
					>
						<Box
							mt={1}
							mb={1}
							ml={0}
						>
							<TopChart
								year={year}
								dataSummary={dataSummary}
								setYear={setYear}
								reportYear={reportYear}
							/>
						</Box>
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
						paddingTop: "1em",
						paddingBottom: "1em",
						backgroundColor: "#f5f8ff",
						borderRadius: "6px",
						position: "relative",
						overflow: "hidden",
					}}
				>
					<GradientPaper />
					<Grid
						container
						direction={"row"}
						spacing={1}
						xs={12}
						flexWrap={"nowrap"}
						mt={2}
					>
						<Grid xs={6}>
							<SummaryChart
								dataSummary={dataSummary}
								year={year}
								clickedDownload={clickedDownload}
								setClickedDownload={setClickedDownload}
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
								<PictogramChart
									dataPictogram={dataPictogram}
									clickedDownload={clickedDownload}
									setClickedDownload={setClickedDownload}
								/>
							</Box>
						</Grid>
					</Grid>
				</Paper>
			</Grid>
		</Container>
	);
}

export default MainContainer;
