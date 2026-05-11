import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import type { Data } from "../utils/processrawdata";
import colors from "../utils/colors";
import { alpha } from "@mui/material/styles";
import StepHeader from "./StepHeader";
import Typography from "@mui/material/Typography";
import MapIcon from "@mui/icons-material/Map";
import MapFilters from "./MapFilters";
import type { InSelectionData } from "../utils/filterData";
import type { List } from "../utils/makelists";
import Map from "./Map";
import processMapData from "../utils/processmapdata";
import Chip from "@mui/material/Chip";

type MapSectionProps = {
	data: Data;
	inSelectionData: InSelectionData;
	showMap: boolean;
	lists: List;
	activities: number[];
	sectors: number[];
};

function MapSection({
	data,
	inSelectionData,
	showMap,
	lists,
	activities,
	sectors,
}: MapSectionProps) {
	const [selectedFunds, setSelectedFunds] = useState<number[]>([
			...inSelectionData.funds,
		]),
		[selectedStatuses, setSelectedStatuses] = useState<number[]>([
			...inSelectionData.statuses,
		]),
		[selectedPartners, setSelectedPartners] = useState<number[]>([
			...inSelectionData.partners,
		]),
		[selectedAdminLevels, setSelectedAdminLevels] = useState<number[]>([
			...inSelectionData.adminLevels,
		]);

	const activityText = activities.length === 1 ? "activity" : "activities";
	const sectorText = sectors.length === 1 ? "sector" : "sectors";

	const mapData = useMemo(() => {
		if (!showMap) {
			return null;
		}

		return processMapData({
			data,
			selectedFunds,
			selectedStatuses,
			selectedPartners,
			selectedAdminLevels,
		});
	}, [
		data,
		selectedFunds,
		selectedStatuses,
		selectedPartners,
		selectedAdminLevels,
		showMap,
	]);

	return (
		<Box
			sx={{
				display: "flex",
				width: "100%",
				justifyContent: "center",
				mb: 6,
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
							width: "100%",
							display: "flex",
							flexDirection: "column",
							gap: 1,
						}}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 2,
								py: 2,
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
								Select sectors and activities above to reveal
								the map.
							</Typography>
						</Box>
					</Box>
				)}
				{showMap && mapData && (
					<Box sx={{ width: "100%", mt: 4 }}>
						<MapFilters
							selectedFunds={selectedFunds}
							setSelectedFunds={setSelectedFunds}
							selectedStatuses={selectedStatuses}
							setSelectedStatuses={setSelectedStatuses}
							selectedPartners={selectedPartners}
							setSelectedPartners={setSelectedPartners}
							selectedAdminLevels={selectedAdminLevels}
							setSelectedAdminLevels={setSelectedAdminLevels}
							inSelectionData={inSelectionData}
							lists={lists}
						/>
						<Box sx={{ width: "100%", height: "1em" }} />
						<Box
							sx={{
								width: "100%",
								position: "relative",
								border: "1px solid #bbb", // Add border here
								borderRadius: "8px", 
								overflow: "hidden",
							}}
						>
							<Map
								mapData={mapData}
								lists={lists}
							/>
							<Chip
								label={
									mapData
										? `${mapData.length} locations (${activities.length} ${activityText} in ${sectors.length} ${sectorText})`
										: "No locations"
								}
								sx={{
									position: "absolute",
									top: 16,
									right: 16,
									zIndex: 1000,
									pointerEvents: "none",
									backgroundColor:
										colors.unColorChip + "BA",
									fontWeight: 500,
									color: "white",
									opacity: 1,
								}}
							/>
						</Box>
					</Box>
				)}
			</Paper>
		</Box>
	);
}

export default MapSection;
