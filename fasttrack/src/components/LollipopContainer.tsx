import React, { useEffect } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function LollipopContainer() {
	useEffect(() => {
		const src =
			"https://cbpfgms.github.io/pbialp_ft/src/d3chartpbialp_ft.js";

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
						id="d3chartcontainerpbialp_ft"
						data-partner="total"
						data-showaverage="true"
						data-selectedcbpfs="none"
						data-netfunding="true"
						data-responsive="true"
					></div>
				</Grid>
			</Grid>
		</Box>
	);
}

const MemoisedFlowContainer = React.memo(LollipopContainer);

export default MemoisedFlowContainer;
