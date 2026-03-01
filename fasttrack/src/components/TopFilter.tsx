import React from "react";
import Grid from "@mui/material/Grid";
import { useSticky } from "../hooks/useSticky";

function TopFilter() {
	const [stickyRef, isSticky] = useSticky<HTMLDivElement>();

	return (
		<Grid
			container
			spacing={2}
			justifyContent={"center"}
			position={"sticky"}
			top={-1}
			mb={2}
			pt={1}
			ref={stickyRef}
			style={{
				minHeight: "100px",
				backgroundColor: "rgba(255,255,255,0.95)",
				zIndex: 1600,
				borderBottom: isSticky ? "1px solid #ccc" : "none",
				boxShadow: isSticky
					? "0px 10px 10px -10px rgba(0,0,0,0.2)"
					: "none",
			}}
		></Grid>
	);
}

const MemoisedTopFilter = React.memo(TopFilter);

export default MemoisedTopFilter;
