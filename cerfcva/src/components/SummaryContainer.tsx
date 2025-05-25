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
			>
				<Typography
					style={{
						fontFamily: "Roboto",
						fontSize: "36px",
						fontWeight: 700,
						color: "#111",
					}}
				>
					CVA Summary
				</Typography>
				<Typography
					style={{
						fontSize: "16px",
						fontWeight: "normal",
						color: "#666",
						fontStyle: "italic",
					}}
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
		</Grid>
	);
}

export default SummaryContainer;
