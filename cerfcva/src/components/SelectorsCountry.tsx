import AccordionComponent from "./Accordion";
import Grid from "@mui/material/Grid";
import { type InSelectionData } from "./SummaryContainer";

type SelectorsCountryProps = {
	yearCountries: number[];
	sectorCountries: number[];
	partnerCountries: number[];
	setYearCountries: React.Dispatch<React.SetStateAction<number[]>>;
	setSectorCountries: React.Dispatch<React.SetStateAction<number[]>>;
	setPartnerCountries: React.Dispatch<React.SetStateAction<number[]>>;
	inSelectionData: InSelectionData;
};

function SelectorsCountry({
	yearCountries,
	sectorCountries,
	partnerCountries,
	setYearCountries,
	setSectorCountries,
	setPartnerCountries,
	inSelectionData,
}: SelectorsCountryProps) {
	return (
		<Grid
			container
			spacing={3}
			position={"relative"}
			zIndex={1000}
		>
			<Grid size={3}>
				<AccordionComponent
					type="Year"
					dataProperty="years"
					selectionProperty="yearsCountries"
					filterType="dropdowncheck"
					value={yearCountries}
					setValue={setYearCountries}
					inSelectionData={inSelectionData}
				/>
			</Grid>
			<Grid sx={{ flexGrow: 1 }}>
				<AccordionComponent
					type="Sector"
					dataProperty="sectors"
					selectionProperty="sectorsCountries"
					filterType="dropdowncheck"
					value={sectorCountries}
					setValue={setSectorCountries}
					inSelectionData={inSelectionData}
				/>
			</Grid>
			<Grid sx={{ flexGrow: 1 }}>
				<AccordionComponent
					type="Partner"
					dataProperty="organizations"
					selectionProperty="partnersCountries"
					filterType="dropdowncheck"
					value={partnerCountries}
					setValue={setPartnerCountries}
					inSelectionData={inSelectionData}
				/>
			</Grid>
		</Grid>
	);
}

export default SelectorsCountry;
