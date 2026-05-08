import { use, useState, useMemo } from "react";
import type { AppData } from "../utils/api";
import Container from "@mui/material/Container";
import SectorSelect from "./SectorSelect";
import { Tooltip } from "react-tooltip";
import ActivitySelect from "./ActivitySelect";
import Box from "@mui/material/Box";
import MapSection from "./MapContainer";
import filterData, { type InSelectionData } from "../utils/filterData";

type MainContainerProps = {
	dataPromise: Promise<AppData>;
};

export type SelectionLevel = "nothing" | "sector" | "sectorAndActivity";

function MainContainer({ dataPromise }: MainContainerProps) {
	const { data, inDataLists, lists } = use(dataPromise);

	const [sectors, setSectors] = useState<number[]>([]),
		[activities, setActivities] = useState<number[]>([]);

	const sectorsComplete = sectors.length > 0;
	const activitiesComplete = activities.length > 0;
	const showMap = sectorsComplete && activitiesComplete;

	const selectionLevel: SelectionLevel = !sectorsComplete
		? "nothing"
		: !activitiesComplete
			? "sector"
			: "sectorAndActivity";

	const { filteredData, inSelectionData } = useMemo(
		() =>
			filterData({
				data,
				sectors,
				activities,
			}),
		[data, sectors, activities],
	);

	return (
		<Container
			disableGutters={true}
			style={{
				paddingLeft: "12px",
				paddingRight: "12px",
			}}
		>
			<Tooltip
				id="tooltip"
				style={{ zIndex: 9999, maxWidth: "400px", textAlign: "center" }}
			/>
			<SectorSelect
				sectors={sectors}
				setSectors={setSectors}
				setActivities={setActivities}
				selectionLevel={selectionLevel}
				inDataLists={inDataLists}
				lists={lists}
				sectorsComplete={sectorsComplete}
			/>
			<Box mb={4} />
			<ActivitySelect
				activities={activities}
				setActivities={setActivities}
				sectors={sectors}
				selectionLevel={selectionLevel}
				lists={lists}
				activitiesComplete={activitiesComplete}
				sectorsComplete={sectorsComplete}
			/>
			<Box mb={4} />
			<MapSection
				data={filteredData}
				key={generateMapKey(inSelectionData)}
				inSelectionData={inSelectionData}
				inDataLists={inDataLists}
				showMap={showMap}
				lists={lists}
			/>
		</Container>
	);
}

export default MainContainer;

function generateMapKey(data: InSelectionData): string {
	const parts = [
		Array.from(data.funds).sort().join(","),
		Array.from(data.statuses).sort().join(","),
		Array.from(data.partners).sort().join(","),
		Array.from(data.adminLevels).sort().join(","),
	];
	return parts.join("|");
}
