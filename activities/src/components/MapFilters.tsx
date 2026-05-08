import Grid from "@mui/material/Grid";
import type { InSelectionData } from "../utils/filterData";
import Dropdown from "./Dropdown";
import type { List } from "../utils/makelists";
import { constants } from "../utils/constants";

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
	lists: List;
};

const { lastAdminLevel } = constants;

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
	lists,
}: MapFiltersProps) {
	const dataArrayFunds = [...inSelectionData.funds];
	const dataArrayStatuses = [...inSelectionData.statuses];
	const dataArrayPartners = [...inSelectionData.partners];
	const dataArrayAdminLevels = [...inSelectionData.adminLevels];

	const namesListFunds = lists.fundNames;
	const namesListStatuses = lists.projectStatus;
	const namesListPartners = lists.organizationTypes;

	const namesListAdminLevels = Array.from(
		{ length: lastAdminLevel },
		(_, i) => i + 1,
	).reduce(
		(acc, level) => {
			acc[level] = `Admin Level ${level}`;
			return acc;
		},
		{} as { [key: number]: string },
	);

	return (
		<Grid
			container
			spacing={2}
		>
			<Grid size={3}>
				<Dropdown
					value={selectedFunds}
					setValue={setSelectedFunds}
					names={dataArrayFunds}
					namesList={namesListFunds}
					type={"Funds"}
					inSelectionData={inSelectionData}
					dataProperty={"funds"}
				/>
			</Grid>
			<Grid size={3}>
				<Dropdown
					value={selectedStatuses}
					setValue={setSelectedStatuses}
					names={dataArrayStatuses}
					namesList={namesListStatuses}
					type={"Statuses"}
					inSelectionData={inSelectionData}
					dataProperty={"statuses"}
				/>
			</Grid>
			<Grid size={3}>
				<Dropdown
					value={selectedPartners}
					setValue={setSelectedPartners}
					names={dataArrayPartners}
					namesList={namesListPartners}
					type={"Partners"}
					inSelectionData={inSelectionData}
					dataProperty={"partners"}
				/>
			</Grid>
			<Grid size={3}>
				<Dropdown
					value={selectedAdminLevels}
					setValue={setSelectedAdminLevels}
					names={dataArrayAdminLevels}
					namesList={namesListAdminLevels}
					type={"Admin Levels"}
					inSelectionData={inSelectionData}
					dataProperty={"adminLevels"}
				/>
			</Grid>
		</Grid>
	);
}

export default MapFilters;
