import React from "react";
import AccordionComponent from "./Accordion";
import Grid from "@mui/material/Unstable_Grid2";
import { SelectorsProps } from "../types";

function Selectors({
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
			<Grid xs={4}>
				<AccordionComponent
					type="Fund"
					dataProperty="funds"
					filterType="dropdowncheck"
					value={fund}
					setValue={setFund}
					inSelectionData={inSelectionData}
				/>
			</Grid>
			<Grid xs={4}>
				<AccordionComponent
					type="Allocation Name"
					dataProperty="allocationTypes"
					filterType="search"
					value={allocationType}
					setValue={setAllocationType}
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
					inSelectionData={inSelectionData}
				/>
			</Grid>
		</Grid>
	);
}

const MemoizedSelectors = React.memo(Selectors);

export default MemoizedSelectors;
