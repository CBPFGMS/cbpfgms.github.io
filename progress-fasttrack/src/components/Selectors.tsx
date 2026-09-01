import AccordionComponent from "./Accordion";
import Grid from "@mui/material/Grid2";
import { InSelectionData } from "../utils/processdatasummary";
import { Tranche } from "./MainContainer";
import AccordionComponentTranche from "./AccordionTranche";

type SelectorsProps = {
	// year: number[];
	// setYear: React.Dispatch<React.SetStateAction<number[]>>;
	fund: number[];
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	// allocationType: number[];
	// setAllocationType: React.Dispatch<React.SetStateAction<number[]>>;
	// allocationSource: number[];
	// setAllocationSource: React.Dispatch<React.SetStateAction<number[]>>;
	inSelectionData: InSelectionData;
	tranche: Tranche;
	setTranche: React.Dispatch<React.SetStateAction<Tranche>>;
};

function Selectors({
	// year,
	// setYear,
	fund,
	setFund,
	// allocationSource,
	// setAllocationSource,
	// allocationType,
	// setAllocationType,
	inSelectionData,
	tranche,
	setTranche,
}: SelectorsProps) {
	return (
		<Grid
			container
			spacing={2}
		>
			{/* <Grid size={2}>
				<AccordionComponent
					type="Year"
					dataProperty="years"
					filterType="dropdowncheck"
					value={year}
					setValue={setYear}
					inSelectionData={inSelectionData}
				/>
			</Grid> */}
			<Grid size={6}>
				<AccordionComponent
					type="Fund"
					dataProperty="funds"
					filterType="dropdowncheck"
					value={fund}
					setValue={setFund}
					inSelectionData={inSelectionData}
					tranche={tranche}
				/>
			</Grid>
			{/* <Grid sx={{ flexGrow: 1 }}>
				<AccordionComponent
					type="Allocation Name"
					dataProperty="allocationTypes"
					filterType="search"
					value={allocationType}
					setValue={setAllocationType}
					inSelectionData={inSelectionData}
				/>
			</Grid> */}
			<Grid size={3.2}>
				<AccordionComponentTranche
					value={tranche}
					setValue={setTranche}
					setFund={setFund}
				/>
			</Grid>
		</Grid>
	);
}

export default Selectors;
