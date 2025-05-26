import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import type {
	DataTopFigures,
	DatumAgencies,
	DatumSectors,
	DatumTypes,
} from "../utils/processdatasummary";
import type { DownloadStates } from "./MainContainer";
import Box from "@mui/material/Box";
import SelectorsSummary from "./SelectorsSummary";
import { type InSelectionDataSummary } from "../utils/processdatasummary";
import { type InSelectionDataCountries } from "../utils/processdatacountries";
import TopFigures from "./TopFigures";
import type { List } from "../utils/makelists";
import TypesChart from "./TypesChart";
import SectorsChart from "./SectorsChart";
import AgenciesChart from "./AgenciesChart";

export type InSelectionData = InSelectionDataCountries & InSelectionDataSummary;

type SummaryContainerProps = {
	dataTopFigures: DataTopFigures;
	dataTypes: DatumTypes[];
	dataSectors: DatumSectors[];
	dataAgencies: DatumAgencies[];
	inSelectionDataSummary: InSelectionDataSummary;
	inSelectionDataCountries: InSelectionDataCountries;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	yearSummary: number[];
	allocationSourceSummary: number[];
	countrySummary: number[];
	setYearSummary: React.Dispatch<React.SetStateAction<number[]>>;
	setAllocationSourceSummary: React.Dispatch<React.SetStateAction<number[]>>;
	setCountrySummary: React.Dispatch<React.SetStateAction<number[]>>;
	lists: List;
};

function SummaryContainer({
	dataTopFigures,
	dataTypes,
	dataSectors,
	dataAgencies,
	inSelectionDataSummary,
	inSelectionDataCountries,
	clickedDownload,
	setClickedDownload,
	yearSummary,
	allocationSourceSummary,
	countrySummary,
	setYearSummary,
	setAllocationSourceSummary,
	setCountrySummary,
	lists,
}: SummaryContainerProps) {
	const inSelectionData: InSelectionData = {
		...inSelectionDataSummary,
		...inSelectionDataCountries,
	};

	return (
		<Grid
			container
			spacing={2}
			direction={"column"}
		>
			<Box
				display={"flex"}
				flexDirection={"column"}
				mb={1}
			>
				<Typography
					style={{
						fontFamily: "Roboto",
						fontSize: "36px",
						fontWeight: 700,
						color: "#111",
					}}
					ml={1}
				>
					CVA Summary
				</Typography>
				<Typography
					style={{
						fontSize: "16px",
						fontWeight: "normal",
						color: "#666",
						fontStyle: "italic",
						marginTop: "-0.5em",
					}}
					ml={1}
				>
					Starting from 1 June 2024
				</Typography>
			</Box>
			<SelectorsSummary
				yearSummary={yearSummary}
				allocationSourceSummary={allocationSourceSummary}
				countrySummary={countrySummary}
				setYearSummary={setYearSummary}
				setAllocationSourceSummary={setAllocationSourceSummary}
				setCountrySummary={setCountrySummary}
				inSelectionData={inSelectionData}
			/>
			<TopFigures dataTopFigures={dataTopFigures} />
			<TypesChart
				dataTypes={dataTypes}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				lists={lists}
				yearSummary={yearSummary}
				countrySummary={countrySummary}
				allocationSourceSummary={allocationSourceSummary}
			/>
			<SectorsChart
				dataSectors={dataSectors}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				lists={lists}
				yearSummary={yearSummary}
				countrySummary={countrySummary}
				allocationSourceSummary={allocationSourceSummary}
			/>
			<AgenciesChart
				dataAgencies={dataAgencies}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				lists={lists}
				yearSummary={yearSummary}
				countrySummary={countrySummary}
				allocationSourceSummary={allocationSourceSummary}
			/>
		</Grid>
	);
}

export default SummaryContainer;
