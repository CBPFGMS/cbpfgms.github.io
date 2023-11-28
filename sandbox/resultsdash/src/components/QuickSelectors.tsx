import { useContext } from "react";
import Box from "@mui/material/Box";
import Dropdown from "./Dropdown";
import DataContext from "../context/DataContext";
import { SelectorsProps, DataContextType, ListObj } from "../types";

function QuickSelectors({
	allocationSource,
	allocationType,
	fund,
	inSelectionData,
	setAllocationSource,
	setAllocationType,
	setFund,
}: SelectorsProps) {
	const apiData = useContext(DataContext) as DataContextType;
	const lists = apiData.lists;

	const dataArrayFunds = [...apiData.inDataLists.funds];
	const dataArrayAllocationTypes = [...apiData.inDataLists.allocationTypes];
	const dataArrayAllocationSources = [
		...apiData.inDataLists.allocationSources,
	];

	const namesListFunds = lists.fundAbbreviatedNames;
	const namesListAllocationTypes = lists.allocationTypes;
	const namesListAllocationSources = lists.allocationSources;

	return (
		<Box
			display={"flex"}
			flexDirection={"row"}
			marginLeft={"4em"}
			gap={1}
		>
			<Dropdown
				value={fund}
				setValue={setFund}
				names={dataArrayFunds}
				namesList={namesListFunds as ListObj}
				type={"Fund"}
				inSelectionData={inSelectionData}
				dataProperty={"funds"}
				fromQuickSelectors={true}
			/>
			<Dropdown
				value={allocationType}
				setValue={setAllocationType}
				names={dataArrayAllocationTypes}
				namesList={namesListAllocationTypes as ListObj}
				type={"Allocation Type"}
				inSelectionData={inSelectionData}
				dataProperty={"allocationTypes"}
				fromQuickSelectors={true}
			/>
			<Dropdown
				value={allocationSource}
				setValue={setAllocationSource}
				names={dataArrayAllocationSources}
				namesList={namesListAllocationSources as ListObj}
				type={"Allocation Source"}
				inSelectionData={inSelectionData}
				dataProperty={"allocationSources"}
				fromQuickSelectors={true}
			/>
		</Box>
	);
}

export default QuickSelectors;
