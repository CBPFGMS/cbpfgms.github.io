import Grid from "@mui/material/Unstable_Grid2";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import GradientPaper from "./GradientPaper";
import { InSelectionData } from "../utils/processdatasummary";
import Selectors from "./Selectors";
import Statuses from "./Statuses";
import { ImplementationStatuses } from "./MainContainer";
import { DataStatuses } from "../utils/processdatastatuses";
import React from "react";

type FiltersContainerProps = {
	year: number[];
	setYear: React.Dispatch<React.SetStateAction<number[]>>;
	fund: number[];
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	allocationSource: number[];
	setAllocationSource: React.Dispatch<React.SetStateAction<number[]>>;
	allocationType: number[];
	setAllocationType: React.Dispatch<React.SetStateAction<number[]>>;
	implementationStatus: ImplementationStatuses[];
	setImplementationStatus: React.Dispatch<
		React.SetStateAction<ImplementationStatuses[]>
	>;
	inSelectionData: InSelectionData;
	menusRef: (node?: Element | null | undefined) => void;
	dataStatuses: DataStatuses;
};

function FiltersContainer({
	year,
	setYear,
	fund,
	setFund,
	allocationSource,
	setAllocationSource,
	allocationType,
	setAllocationType,
	inSelectionData,
	menusRef,
	implementationStatus,
	setImplementationStatus,
	dataStatuses,
}: FiltersContainerProps) {
	return (
		<Grid
			container
			spacing={2}
		>
			<Paper
				elevation={0}
				style={{
					width: "100%",
					padding: "1em",
					backgroundColor: "#f5f8ff",
					borderRadius: "8px",
					position: "relative",
				}}
			>
				<Box
					style={{
						width: "100%",
						height: "100%",
						overflow: "hidden",
						position: "absolute",
						borderRadius: "8px",
						boxSizing: "border-box",
						top: "0px",
						left: "0px",
						pointerEvents: "none",
					}}
				>
					<GradientPaper />
				</Box>
				<Grid
					ref={menusRef}
					xs={12}
				>
					<Selectors
						year={year}
						setYear={setYear}
						fund={fund}
						setFund={setFund}
						allocationSource={allocationSource}
						setAllocationSource={setAllocationSource}
						allocationType={allocationType}
						setAllocationType={setAllocationType}
						inSelectionData={inSelectionData}
					/>
				</Grid>
				<Grid
					xs={12}
					display={"flex"}
					justifyContent={"flex-start"}
				>
					<Statuses
						dataStatuses={dataStatuses}
						implementationStatus={implementationStatus}
						setImplementationStatus={setImplementationStatus}
					/>
				</Grid>
			</Paper>
		</Grid>
	);
}

const MemoizedFiltersContainer = React.memo(FiltersContainer);

export default MemoizedFiltersContainer;
