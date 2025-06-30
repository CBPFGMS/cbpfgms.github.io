import { useContext, useState, useMemo } from "react";
import DataContext, { type DataContextType } from "../context/DataContext";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import GradientPaper from "./GradientPaper";
import Divider from "@mui/material/Divider";
import { Tooltip } from "react-tooltip";
import constants from "../utils/constants";
import useUpdateQueryString from "../hooks/useupdatequerystring";
import processData from "../utils/processdata";
import colors from "../utils/colors";
import TopFigures from "./TopFigures";
import Selectors from "./Selectors";
import FundsChart from "./FundsChart";
import CvaChart from "./CvaChart";

type MainContainerProps = {
	defaultYear: number;
};

const { charts } = constants;

export type Charts = (typeof charts)[number];

export type DownloadStates = {
	[K in Charts]: boolean;
};

const downloadStates = charts.reduce(
	(acc, chart) => ((acc[chart] = false), acc),
	{} as DownloadStates
);

const queryStringValues = new URLSearchParams(location.search);

function MainContainer({ defaultYear }: MainContainerProps) {
	const { data, inDataLists, lists } = useContext(
		DataContext
	) as DataContextType;

	const [year, setYear] = useState<number[]>([defaultYear]),
		[organizationType, setOrganizationType] = useState<number[]>([
			...inDataLists.organizationTypes,
		]),
		[fund, setFund] = useState<number[]>([...inDataLists.funds]);

	const [clickedDownload, setClickedDownload] =
		useState<DownloadStates>(downloadStates);

	const { dataTopFigures, dataCvaTypes, dataFunds, inSelectionData } =
		useMemo(
			() =>
				processData({
					data,
					year,
					organizationType,
					fund,
					lists,
				}),
			[data, year, organizationType, fund, lists]
		);

	useUpdateQueryString({
		year,
		organizationType,
		inDataLists,
		queryStringValues,
		fund,
		setFund,
		setYear,
		setOrganizationType,
		setClickedDownload,
		downloadStates,
		defaultYear,
	});

	return (
		<Box>
			<Tooltip
				id="tooltip"
				style={{ zIndex: 9999, maxWidth: "400px", textAlign: "center" }}
			/>
			<Box
				mt={3}
				mb={3}
			/>
			<Grid
				container
				spacing={2}
			>
				<Paper
					elevation={0}
					style={{
						width: "100%",
						padding: "1em",
						backgroundColor: colors.paperColor,
						borderRadius: "8px",
						position: "relative",
					}}
				>
					<GradientPaper />
					<Selectors
						year={year}
						organizationType={organizationType}
						setYear={setYear}
						setOrganizationType={setOrganizationType}
						inSelectionData={inSelectionData}
					/>
					<Box mt={3} />
					<TopFigures
						dataTopFigures={dataTopFigures}
						year={year}
					/>
					<Grid
						container
						spacing={2}
						style={{ marginTop: "4em" }}
					>
						<Grid size={5.8}>
							<FundsChart
								data={dataFunds}
								year={year}
								fund={fund}
								organizationType={organizationType}
								setFund={setFund}
								clickedDownload={clickedDownload}
								setClickedDownload={setClickedDownload}
								lists={lists}
								inDataLists={inDataLists}
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
						<Grid size={5.8}>
							<CvaChart
								data={dataCvaTypes}
								year={year}
								fund={fund}
								organizationType={organizationType}
								clickedDownload={clickedDownload}
								setClickedDownload={setClickedDownload}
								lists={lists}
								inDataLists={inDataLists}
							/>
						</Grid>
					</Grid>
				</Paper>
			</Grid>
		</Box>
	);
}

export default MainContainer;
