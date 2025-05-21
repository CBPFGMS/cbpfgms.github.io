import { useContext, useState, useMemo, use } from "react";
import DataContext, { type DataContextType } from "../context/DataContext";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import GradientPaper from "./GradientPaper";
import Divider from "@mui/material/Divider";
import { Tooltip } from "react-tooltip";
import constants from "../utils/constants";
import useUpdateQueryString from "../hooks/useupdatequerystring";
import TopIntro from "./TopIntro";

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

	const [yearSummary, setYearSummary] = useState<number[]>([defaultYear]),
		[countrySummary, setCountrySummary] = useState<number[]>([
			...inDataLists.funds,
		]),
		[allocationSourceSummary, setAllocationSourceSummary] = useState<
			number[]
		>([...inDataLists.allocationSources]),
		[yearCountries, setYearCountries] = useState<number[]>([defaultYear]),
		[sectorCountries, setSectorCountries] = useState<number[]>([
			...inDataLists.sectors,
		]),
		[partnerCountries, setPartnerCountries] = useState<number[]>([
			...inDataLists.organizations,
		]);

	const [clickedDownload, setClickedDownload] =
		useState<DownloadStates>(downloadStates);

	const { dataTopFigures, dataTypes, dataSectors, dataAgencies } =
		useMemo(() => {
			processDataSummary({
				data,
				yearSummary,
				countrySummary,
				allocationSourceSummary,
				lists,
			});
		}, [data, yearSummary, countrySummary, allocationSourceSummary, lists]);

	const dataCountries = useMemo(() => {
		processDataCountries({
			data,
			yearCountries,
			sectorCountries,
			partnerCountries,
		});
	}, [data, yearCountries, sectorCountries, partnerCountries]);

	return (
		<Container
			disableGutters={true}
			style={{
				paddingLeft: "12px",
				paddingRight: "12px",
			}}
		>
			<Tooltip
				id="tooltip"
				style={{ zIndex: 9999, maxWidth: "400px", textAlign: "center" }}
			/>
			<TopIntro />
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
						backgroundColor: "#f5f8ff",
						borderRadius: "8px",
						position: "relative",
					}}
				>
					<GradientPaper />
				</Paper>
			</Grid>
		</Container>
	);
}

export default MainContainer;
