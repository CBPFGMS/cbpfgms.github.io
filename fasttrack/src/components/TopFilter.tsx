import React from "react";
import Grid from "@mui/material/Grid";
import { useSticky } from "../hooks/useSticky";
import type { InSelectionData } from "../utils/processdatatopfigures";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import AccordionComponent from "./Accordion";
import AccordionComponentTranche from "./AccordionTranche";
import DropdownStatus from "./DropdownStatus";
import type { List } from "../utils/makelists";
import type { Tranche } from "./MainContainer";

type TopFilterProps = {
	inSelectionData: InSelectionData;
	fund: number[];
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	status: number[];
	setStatus: React.Dispatch<React.SetStateAction<number[]>>;
	tranche: Tranche;
	setTranche: React.Dispatch<React.SetStateAction<Tranche>>;
	lists: List;
};

function TopFilter({
	inSelectionData,
	fund,
	setFund,
	status,
	setStatus,
	tranche,
	setTranche,
	lists,
}: TopFilterProps) {
	const [stickyRef, isSticky] = useSticky<HTMLDivElement>();

	return (
		<Grid
			container
			justifyContent={"center"}
			alignItems={"center"}
			position={"sticky"}
			top={-1}
			mb={2}
			mt={3}
			pt={3}
			pb={3}
			ref={stickyRef}
			style={{
				backgroundColor: "rgba(255,255,255,0.95)",
				zIndex: 1200,
				borderBottom: isSticky ? "1px solid #ccc" : "none",
				boxShadow: isSticky
					? "0px 10px 10px -10px rgba(0,0,0,0.2)"
					: "none",
			}}
		>
			<Box
				style={{
					display: "flex",
					flexDirection: "row",
					width: "100%",
					alignItems: "center",
					justifyContent: isSticky ? "space-between" : "flex-start",
				}}
			>
				<Typography
					variant={isSticky ? "body1" : "h6"}
					sx={{ paddingRight: "0.5em" }}
				>
					Select Fund:
				</Typography>
				<Grid
					size={isSticky ? 3 : 4}
					sx={{ paddingRight: "2em" }}
				>
					<AccordionComponent
						value={fund}
						setValue={setFund}
						inSelectionData={inSelectionData}
					/>
				</Grid>
				{isSticky && (
					<>
						<Typography
							variant={isSticky ? "body1" : "h6"}
							sx={{ paddingRight: "0.5em" }}
						>
							Select Tranche:
						</Typography>
						<Grid
							size={3}
							sx={{ paddingRight: "2em" }}
						>
							<AccordionComponentTranche
								value={tranche}
								setValue={setTranche}
							/>
						</Grid>
					</>
				)}
				{isSticky && (
					<Grid size={3}>
						<DropdownStatus
							value={status}
							setValue={setStatus}
							inSelectionData={inSelectionData}
							namesList={lists.projectStatus}
						/>
					</Grid>
				)}
			</Box>
		</Grid>
	);
}

const MemoisedTopFilter = React.memo(TopFilter);

export default MemoisedTopFilter;
