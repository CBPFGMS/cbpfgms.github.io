import AccordionComponent from "./Accordion";
import Grid from "@mui/material/Grid2";
import { InSelectionData } from "../utils/processdatasummary";

type SelectorsProps = {
	year: number[];
	setYear: React.Dispatch<React.SetStateAction<number[]>>;
	fund: number[];
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	allocationType: number[];
	setAllocationType: React.Dispatch<React.SetStateAction<number[]>>;
	allocationSource: number[];
	setAllocationSource: React.Dispatch<React.SetStateAction<number[]>>;
	inSelectionData: InSelectionData;
};

function Selectors({
	year,
	setYear,
	fund,
	setFund,
	allocationSource,
	setAllocationSource,
	allocationType,
	setAllocationType,
	inSelectionData,
}: SelectorsProps) {
	return (
		<Grid
			container
			spacing={1}
		>
			<Grid size={2}>
				<AccordionComponent
					type="Year"
					dataProperty="years"
					filterType="dropdowncheck"
					value={year}
					setValue={setYear}
					inSelectionData={inSelectionData}
				/>
			</Grid>
			<Grid sx={{ flexGrow: 1 }}>
				<AccordionComponent
					type="Fund"
					dataProperty="funds"
					filterType="dropdowncheck"
					value={fund}
					setValue={setFund}
					inSelectionData={inSelectionData}
				/>
			</Grid>
			<Grid sx={{ flexGrow: 1 }}>
				<AccordionComponent
					type="Allocation Name"
					dataProperty="allocationTypes"
					filterType="search"
					value={allocationType}
					setValue={setAllocationType}
					inSelectionData={inSelectionData}
				/>
			</Grid>
			<Grid sx={{ flexGrow: 1 }}>
				<AccordionComponent
					type="Allocation Source"
					dataProperty="allocationSources"
					filterType="checkbox"
					value={allocationSource}
					setValue={setAllocationSource}
					inSelectionData={inSelectionData}
				/>
			</Grid>
		</Grid>
	);
}

export default Selectors;
