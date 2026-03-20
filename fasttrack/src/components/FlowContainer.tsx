import React, { useEffect } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
function FlowContainer() {
	useEffect(() => {
		const src =
			"https://cbpfgms.github.io/pbinad_ft/src/d3chartpbinad_ft-stg.js";
		if (document.querySelector(`script[src="${src}"]`)) return;

		const script = document.createElement("script");
		script.src = src;
		script.async = true;

		document.body.appendChild(script);
	}, []);

	return (
		<Box>
			<Grid
				container
				spacing={2}
				position={"relative"}
			>
				<Grid
					size={12}
					mb={3}
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
						Allocations Flow
					</Typography>
				</Grid>
			</Grid>
			<Grid
				container
				spacing={2}
				position={"relative"}
			>
				<div
					id="d3chartcontainerpbinad_ft"
					data-year="2026"
					data-cbpf="all"
					data-aggregate="type"
					data-minpercentage="3"
					data-showhelp="false"
					data-showlink="false"
					data-responsive="true"
					data-lazyload="true"
				></div>
			</Grid>
		</Box>
	);
}

const MemoisedFlowContainer = React.memo(FlowContainer);

export default MemoisedFlowContainer;
