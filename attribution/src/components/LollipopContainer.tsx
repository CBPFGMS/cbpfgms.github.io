import React, { useEffect } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PercentageIconLollipop from "./PercentageIconLollipop";

type LollipopContainerProps = {
	donorName: string;
	attribution: number;
};

function LollipopContainer({ donorName, attribution }: LollipopContainerProps) {
	useEffect(() => {
		// const src =
		// 	"https://cbpfgms.github.io/pbialp_attribution/src/d3chartpbialp_attribution.js";

		const src = "./d3chartpbialp_attribution.js";

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
				sx={{
					position: "relative",
				}}
			>
				<Grid
					size={12}
					sx={{
						mb: 4,
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
								fontSize: "2rem",
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
					size={11}
					sx={{ margin: "0 auto" }}
				>
					<div
						id="d3chartcontainerpbialp_attribution"
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
