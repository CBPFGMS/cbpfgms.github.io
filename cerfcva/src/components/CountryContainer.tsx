import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { type DatumCountries } from "../utils/processdatacountries";
import type { DownloadStates } from "./MainContainer";
import Box from "@mui/material/Box";
import SelectorsCountry from "./SelectorsCountry";
import { type InSelectionDataSummary } from "../utils/processdatasummary";
import { type InSelectionDataCountries } from "../utils/processdatacountries";
import Map from "./Map";
import Legend from "./Legend";

export type InSelectionData = InSelectionDataCountries & InSelectionDataSummary;

type CountryContainerProps = {
	dataCountries: DatumCountries[];
	inSelectionDataSummary: InSelectionDataSummary;
	inSelectionDataCountries: InSelectionDataCountries;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	yearCountries: number[];
	sectorCountries: number[];
	partnerCountries: number[];
	setYearCountries: React.Dispatch<React.SetStateAction<number[]>>;
	setSectorCountries: React.Dispatch<React.SetStateAction<number[]>>;
	setPartnerCountries: React.Dispatch<React.SetStateAction<number[]>>;
};

function CountryContainer({
	dataCountries,
	inSelectionDataSummary,
	inSelectionDataCountries,
	clickedDownload,
	setClickedDownload,
	yearCountries,
	sectorCountries,
	partnerCountries,
	setYearCountries,
	setSectorCountries,
	setPartnerCountries,
}: CountryContainerProps) {
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
					CVA by Country
				</Typography>
			</Box>
			<SelectorsCountry
				yearCountries={yearCountries}
				sectorCountries={sectorCountries}
				partnerCountries={partnerCountries}
				setYearCountries={setYearCountries}
				setSectorCountries={setSectorCountries}
				setPartnerCountries={setPartnerCountries}
				inSelectionData={inSelectionData}
			/>
			<Map
				data={dataCountries}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				yearCountries={yearCountries}
				sectorCountries={sectorCountries}
				partnerCountries={partnerCountries}
			/>
			<Box
				style={{
					display: "flex",
					justifyContent: "flex-start",
					alignItems: "center",
					flexDirection: "row",
				}}
			>
				<Legend />
			</Box>
		</Grid>
	);
}

export default CountryContainer;
