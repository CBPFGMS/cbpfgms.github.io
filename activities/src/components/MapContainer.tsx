import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import type { Data, InDataLists } from "../utils/processrawdata";
import colors from "../utils/colors";
import { alpha } from "@mui/material/styles";
import StepHeader from "./StepHeader";
import Typography from "@mui/material/Typography";
import MapIcon from "@mui/icons-material/Map";

type MapContainerProps = {
	data: Data;
	inDataLists: InDataLists;
	showMap: boolean;
};

function MapContainer({ data, inDataLists, showMap }: MapContainerProps) {
	return (
		<Box
			sx={{
				display: "flex",
				width: "100%",
				justifyContent: "center",
			}}
		>
			<Paper
				elevation={0}
				sx={{
					width: "80%",
					p: { xs: 2.5, md: 3 },
					transition: "all 0.3s ease",
					borderRadius: 4,
					border: "1.5px solid",
					borderColor: showMap
						? alpha(colors.doneGradientStart, 0.25)
						: alpha(colors.inactiveBackground, 0.1),
					opacity: showMap ? 1 : 0.45,
					pointerEvents: showMap ? "auto" : "none",
					boxShadow: showMap
						? "0 12px 40px rgba(26,92,150,0.1)"
						: "none",
				}}
			>
				<StepHeader
					number="3"
					title="Explore the Map"
					subtitle="Zoom in to see individual activity markers and hover over them for details. Use the menus below to filter the results."
					active={showMap}
					done={false}
				/>
				{!showMap && (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 1,
							py: 1.5,
							px: 2,
							mt: 4,
							borderRadius: 2,
							background: alpha("#4a5f78", 0.05),
						}}
					>
						<MapIcon
							sx={{
								fontSize: 16,
								color: "text.disabled",
							}}
						/>
						<Typography
							variant="body2"
							sx={{ fontStyle: "italic" }}
						>
							Select sectors and activities above to reveal the
							map.
						</Typography>
					</Box>
				)}
			</Paper>
		</Box>
	);
}

export default MapContainer;
