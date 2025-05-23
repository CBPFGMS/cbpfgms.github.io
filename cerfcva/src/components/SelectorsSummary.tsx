import AccordionComponent from "./Accordion";
import Grid from "@mui/material/Grid";
import { type InSelectionData } from "./SummaryContainer";

type SelectorsSummaryProps = {
	yearSummary: number[];
	allocationSourceSummary: number[];
	countrySummary: number[];
	setYearSummary: React.Dispatch<React.SetStateAction<number[]>>;
	setAllocationSourceSummary: React.Dispatch<React.SetStateAction<number[]>>;
	setCountrySummary: React.Dispatch<React.SetStateAction<number[]>>;
	inSelectionData: InSelectionData;
};

function SelectorsSummary({
	yearSummary,
	allocationSourceSummary,
	countrySummary,
	setYearSummary,
	setAllocationSourceSummary,
	setCountrySummary,
	inSelectionData,
}: SelectorsSummaryProps) {
	return (
		<Grid
			container
			spacing={3}
		>
			<Grid size={3}>
				<AccordionComponent
					type="Year"
					dataProperty="years"
					selectionProperty="yearsSummary"
					filterType="dropdowncheck"
					value={yearSummary}
					setValue={setYearSummary}
					inSelectionData={inSelectionData}
				/>
			</Grid>
			<Grid sx={{ flexGrow: 1 }}>
				<AccordionComponent
					type="Country"
					dataProperty="countries"
					selectionProperty="countriesSummary"
					filterType="search"
					value={countrySummary}
					setValue={setCountrySummary}
					inSelectionData={inSelectionData}
				/>
			</Grid>
			<Grid sx={{ flexGrow: 1 }}>
				<AccordionComponent
					type="Allocation Window"
					dataProperty="allocationSources"
					selectionProperty="allocationSourcesSummary"
					filterType="checkbox"
					value={allocationSourceSummary}
					setValue={setAllocationSourceSummary}
					inSelectionData={inSelectionData}
				/>
			</Grid>
		</Grid>
	);
}

export default SelectorsSummary;
