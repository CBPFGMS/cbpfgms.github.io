import { use, useState } from "react";
import type { AppData } from "../utils/api";
import Container from "@mui/material/Container";
import SectorSelect from "./SectorSelect";

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

	const selectionLevel: SelectionLevel = !sectorsComplete
		? "nothing"
		: !activitiesComplete
			? "sector"
			: "sectorAndActivity";

	return (
		<Container
			disableGutters={true}
			style={{
				paddingLeft: "12px",
				paddingRight: "12px",
			}}
		>
			<SectorSelect
				sectors={sectors}
				setSectors={setSectors}
				selectionLevel={selectionLevel}
				inDataLists={inDataLists}
				lists={lists}
				sectorsComplete={sectorsComplete}
			/>
		</Container>
	);
}

export default MainContainer;
