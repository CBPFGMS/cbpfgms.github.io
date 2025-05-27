import { useContext, useState, useMemo } from "react";
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
import processDataSummary from "../utils/processdatasummary";
import processDataCountries from "../utils/processdatacountries";
import SummaryContainer from "./SummaryContainer";
import colors from "../utils/colors";
import CountryContainer from "./CountryContainer";

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
			...inDataLists.countries,
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

	const {
		dataTopFigures,
		dataTypes,
		dataSectors,
		dataAgencies,
		inSelectionDataSummary,
	} = useMemo(
		() =>
			processDataSummary({
				data,
				yearSummary,
				countrySummary,
				allocationSourceSummary,
				lists,
			}),
		[data, yearSummary, countrySummary, allocationSourceSummary, lists]
	);

	const { dataCountries, inSelectionDataCountries } = useMemo(
		() =>
			processDataCountries({
				data,
				yearCountries,
				sectorCountries,
				partnerCountries,
				lists,
			}),
		[data, yearCountries, sectorCountries, partnerCountries, lists]
	);

	useUpdateQueryString({
		yearSummary,
		countrySummary,
		allocationSourceSummary,
		yearCountries,
		sectorCountries,
		partnerCountries,
		inDataLists,
		queryStringValues,
		setYearSummary,
		setCountrySummary,
		setAllocationSourceSummary,
		setYearCountries,
		setSectorCountries,
		setPartnerCountries,
		setClickedDownload,
		downloadStates,
		defaultYear,
	});

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
						backgroundColor: colors.paperColor,
						borderRadius: "8px",
						position: "relative",
					}}
				>
					<GradientPaper />
					<SummaryContainer
						dataTopFigures={dataTopFigures}
						dataTypes={dataTypes}
						dataSectors={dataSectors}
						dataAgencies={dataAgencies}
						inSelectionDataSummary={inSelectionDataSummary}
						inSelectionDataCountries={inSelectionDataCountries}
						clickedDownload={clickedDownload}
						setClickedDownload={setClickedDownload}
						yearSummary={yearSummary}
						allocationSourceSummary={allocationSourceSummary}
						countrySummary={countrySummary}
						setYearSummary={setYearSummary}
						setAllocationSourceSummary={setAllocationSourceSummary}
						setCountrySummary={setCountrySummary}
						lists={lists}
					/>
					<Divider
						orientation="horizontal"
						flexItem
						style={{
							borderTop: "3px dotted #ccc",
							borderBottom: "none",
							width: "96%",
							marginLeft: "2%",
							marginTop: "2em",
							marginBottom: "2em",
						}}
					/>
					<CountryContainer
						dataCountries={dataCountries}
						inSelectionDataSummary={inSelectionDataSummary}
						inSelectionDataCountries={inSelectionDataCountries}
						clickedDownload={clickedDownload}
						setClickedDownload={setClickedDownload}
						yearCountries={yearCountries}
						sectorCountries={sectorCountries}
						partnerCountries={partnerCountries}
						setYearCountries={setYearCountries}
						setSectorCountries={setSectorCountries}
						setPartnerCountries={setPartnerCountries}
					/>
				</Paper>
			</Grid>
		</Container>
	);
}

export default MainContainer;
