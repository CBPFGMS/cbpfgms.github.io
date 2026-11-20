import React, { useEffect, useRef } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { d3Chart } from "../charts/d3chartpbialp_attribution";
import type { AllocationsLollipopObject } from "../utils/schemas";
import { select } from "d3";

type LollipopContainerProps = {
	lollipopData: AllocationsLollipopObject[];
};

function LollipopContainer({ lollipopData }: LollipopContainerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const drawRef = useRef<
		((rawData: AllocationsLollipopObject[]) => void) | null
	>(null);

	useEffect(() => {
		const node = containerRef.current;
		if (!node) return;

		drawRef.current = d3Chart(node);

		return () => {
			select(node).selectAll("*").remove();
		};
	}, []);

	useEffect(() => {
		if (!drawRef.current) return;
		drawRef.current(lollipopData);
	}, [lollipopData]);

	return (
		<Box>
			<Grid
				container
				spacing={2}
				position={"relative"}
			>
				<Grid
					size={12}
					mb={2}
				>
					<Typography
						style={{
							color: "var(--ocha-blue)",
							fontWeight: 700,
							margin: "30px 0 22px 0",
							textAlign: "center",
							fontSize: "2rem",
							fontFamily: "Montserrat",
						}}
					>
						Allocations by Organization Type
					</Typography>
				</Grid>
			</Grid>
			<Grid
				container
				spacing={2}
				position={"relative"}
			>
				<Grid size={12}>
					<div
						ref={containerRef}
						id="d3chartcontainerpbialp_attribution"
					></div>
				</Grid>
			</Grid>
		</Box>
	);
}

const MemoisedFlowContainer = React.memo(LollipopContainer);

export default MemoisedFlowContainer;
