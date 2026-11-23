import Grid from "@mui/material/Grid2";
import { InSelectionData } from "../utils/processdatasummary";
import Selectors from "./Selectors";
import Statuses from "./Statuses";
import { ImplementationStatuses, Tranche } from "./MainContainer";
import {
	DataStatuses,
	DataStatusesBeneficiaries,
} from "../utils/processdatastatuses";
import React from "react";

type FiltersContainerProps = {
	// year: number[];
	// setYear: React.Dispatch<React.SetStateAction<number[]>>;
	fund: number[];
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	// allocationSource: number[];
	// setAllocationSource: React.Dispatch<React.SetStateAction<number[]>>;
	// allocationType: number[];
	// setAllocationType: React.Dispatch<React.SetStateAction<number[]>>;
	implementationStatus: ImplementationStatuses[];
	setImplementationStatus: React.Dispatch<
		React.SetStateAction<ImplementationStatuses[]>
	>;
	inSelectionData: InSelectionData;
	menusRef: (node?: Element | null | undefined) => void;
	dataStatuses: DataStatuses;
	dataStatusesBeneficiaries: DataStatusesBeneficiaries;
	tranche: Tranche;
	setTranche: React.Dispatch<React.SetStateAction<Tranche>>;
};

function FiltersContainer({
	// year,
	// setYear,
	fund,
	setFund,
	// allocationSource,
	// setAllocationSource,
	// allocationType,
	// setAllocationType,
	inSelectionData,
	menusRef,
	implementationStatus,
	setImplementationStatus,
	dataStatuses,
	dataStatusesBeneficiaries,
	tranche,
	setTranche,
}: FiltersContainerProps) {
	return (
		<Grid
			container
			spacing={2}
			mt={2}
		>
			<Grid
				ref={menusRef}
				size={12}
				mb={2}
			>
				<Selectors
					// year={year}
					// setYear={setYear}
					fund={fund}
					setFund={setFund}
					// allocationSource={allocationSource}
					// setAllocationSource={setAllocationSource}
					// allocationType={allocationType}
					// setAllocationType={setAllocationType}
					inSelectionData={inSelectionData}
					tranche={tranche}
					setTranche={setTranche}
				/>
			</Grid>
			<Grid
				size={12}
				display={"flex"}
				justifyContent={"flex-start"}
			>
				<Statuses
					dataStatuses={dataStatuses}
					dataStatusesBeneficiaries={dataStatusesBeneficiaries}
					implementationStatus={implementationStatus}
					setImplementationStatus={setImplementationStatus}
				/>
			</Grid>
		</Grid>
	);
}

const MemoizedFiltersContainer = React.memo(FiltersContainer);

export default MemoizedFiltersContainer;
