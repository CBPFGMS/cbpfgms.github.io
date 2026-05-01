import Grid from "@mui/material/Grid";
import type { InSelectionData } from "../utils/filterData";
import Dropdown from "./Dropdown";

type MapFiltersProps = {
	selectedFunds: number[];
	setSelectedFunds: React.Dispatch<React.SetStateAction<number[]>>;
	selectedStatuses: number[];
	setSelectedStatuses: React.Dispatch<React.SetStateAction<number[]>>;
	selectedPartners: number[];
	setSelectedPartners: React.Dispatch<React.SetStateAction<number[]>>;
	selectedAdminLevels: number[];
	setSelectedAdminLevels: React.Dispatch<React.SetStateAction<number[]>>;
	inSelectionData: InSelectionData;
};

function MapFilters({
	selectedFunds,
	setSelectedFunds,
	selectedStatuses,
	setSelectedStatuses,
	selectedPartners,
	setSelectedPartners,
	selectedAdminLevels,
	setSelectedAdminLevels,
	inSelectionData,
}: MapFiltersProps) {
	return (
		<Grid
			container
			spacing={2}
		>
			<Grid size={3}></Grid>
		</Grid>
	);
}

export default MapFilters;
