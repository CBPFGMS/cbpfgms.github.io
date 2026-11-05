import React, { useRef, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PercentageIconLollipop from "./PercentageIconLollipop";
import { d3Chart } from "../charts/d3chartpbialp_attribution";
import type { AllocationsLollipopObject } from "../utils/schemas";
import { select } from "d3";

type LollipopContainerProps = {
	donorName: string;
	attribution: number;
	lollipopData: AllocationsLollipopObject[];
};

function LollipopContainer({
	donorName,
	attribution,
	lollipopData,
}: LollipopContainerProps) {
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
				sx={{
					position: "relative",
				}}
			>
				<Grid
					size={12}
					sx={{
						mb: 3,
					}}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexDirection: "row",
						}}
					>
						<PercentageIconLollipop
							donorName={donorName}
							attribution={attribution}
						/>
						<Typography
							style={{
								color: "var(--ocha-blue)",
								fontWeight: 700,
								textAlign: "center",
								fontSize: "1.8rem",
								fontFamily: "Montserrat",
								marginLeft: "16px",
							}}
						>
							Allocations by Organization Type
						</Typography>
					</Box>
				</Grid>
			</Grid>
			<Grid
				container
				spacing={2}
				sx={{
					position: "relative",
					pb: 2,
				}}
			>
				<Grid
					size={12}
					sx={{ margin: "0 auto" }}
				>
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
