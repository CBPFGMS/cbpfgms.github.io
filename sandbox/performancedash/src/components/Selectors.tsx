import { useState } from "react";
import AccordionComponent from "./Accordion";
import Grid from "@mui/material/Unstable_Grid2";

function Selectors({
	fund,
	setFund,
	allocationSource,
	setAllocationSource,
	allocationType,
	setAllocationType,
	inSelectionData
}: SelectorsProps) {
	const [expanded, setExpanded] = useState<string | false>(false);

	const handleAccordionExpand =
		(panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
			setExpanded(isExpanded ? panel : false);
		};

	return (
		<Grid
			container
			spacing={1}
		>
			<Grid xs={4}>
				<AccordionComponent
					type="Fund"
					dataProperty="funds"
					filterType="dropdowncheck"
					value={fund}
					setValue={setFund}
					expanded={expanded}
					handleAccordionExpand={handleAccordionExpand}
					inSelectionData={inSelectionData}
				/>
			</Grid>
			<Grid xs={4}>
				<AccordionComponent
					type="Allocation Type"
					dataProperty="allocationTypes"
					filterType="search"
					value={allocationType}
					setValue={setAllocationType}
					expanded={expanded}
					handleAccordionExpand={handleAccordionExpand}
					inSelectionData={inSelectionData}
				/>
			</Grid>
			<Grid xs={4}>
				<AccordionComponent
					type="Allocation Source"
					dataProperty="allocationSources"
					filterType="checkbox"
					value={allocationSource}
					setValue={setAllocationSource}
					expanded={expanded}
					handleAccordionExpand={handleAccordionExpand}
					inSelectionData={inSelectionData}
				/>
			</Grid>
		</Grid>
	);
}

export default Selectors;
