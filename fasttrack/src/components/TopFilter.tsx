import React from "react";
import Grid from "@mui/material/Grid";
import { useSticky } from "../hooks/useSticky";
import type { InSelectionData } from "../utils/processdatatopfigures";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import AccordionComponent from "./Accordion";

type TopFilterProps = {
	inSelectionData: InSelectionData;
	fund: number[];
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
};

function TopFilter({ inSelectionData, fund, setFund }: TopFilterProps) {
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
					gap: "2em",
					width: "100%",
					alignItems: "center",
				}}
			>
				<Typography variant="h6">Select Fund:</Typography>
				<Grid size={4}>
					<AccordionComponent
						value={fund}
						setValue={setFund}
						inSelectionData={inSelectionData}
					/>
				</Grid>
			</Box>
		</Grid>
	);
}

const MemoisedTopFilter = React.memo(TopFilter);

export default MemoisedTopFilter;
