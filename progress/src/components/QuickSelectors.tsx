import { useContext } from "react";
import Box from "@mui/material/Box";
import Dropdown from "./Dropdown";
import DataContext, { DataContextType } from "../context/DataContext";
import { InSelectionData } from "../utils/processdatasummary";
import { makeYearsList } from "../utils/makeyearslist";

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

function QuickSelectors({
	allocationSource,
	allocationType,
	fund,
	year,
	inSelectionData,
	setAllocationSource,
	setAllocationType,
	setFund,
	setYear,
}: SelectorsProps) {
	const { lists, inDataLists } = useContext(DataContext) as DataContextType;

	const dataArrayYears = [...inDataLists.years];
	const dataArrayFunds = [...inDataLists.funds];
	const dataArrayAllocationTypes = [...inDataLists.allocationTypes];
	const dataArrayAllocationSources = [...inDataLists.allocationSources];

	const yearsList = makeYearsList(dataArrayYears);
	const namesListFunds = lists.fundNames;
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
				value={year}
				setValue={setYear}
				names={dataArrayYears}
				namesList={yearsList}
				type={"Year"}
				inSelectionData={inSelectionData}
				dataProperty={"years"}
				fromQuickSelectors={true}
			/>
			<Dropdown
				value={fund}
				setValue={setFund}
				names={dataArrayFunds}
				namesList={namesListFunds}
				type={"Fund"}
				inSelectionData={inSelectionData}
				dataProperty={"funds"}
				fromQuickSelectors={true}
			/>
			<Dropdown
				value={allocationType}
				setValue={setAllocationType}
				names={dataArrayAllocationTypes}
				namesList={namesListAllocationTypes}
				type={"Allocation Type"}
				inSelectionData={inSelectionData}
				dataProperty={"allocationTypes"}
				fromQuickSelectors={true}
			/>
			<Dropdown
				value={allocationSource}
				setValue={setAllocationSource}
				names={dataArrayAllocationSources}
				namesList={namesListAllocationSources}
				type={"Allocation Source"}
				inSelectionData={inSelectionData}
				dataProperty={"allocationSources"}
				fromQuickSelectors={true}
			/>
		</Box>
	);
}

export default QuickSelectors;
