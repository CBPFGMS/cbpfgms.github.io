import { useState } from "react";
import Container from "@mui/material/Container";
import { useAppData } from "../hooks/useappdata";
import { constants } from "../utils/constants";
import { Tooltip } from "react-tooltip";

const { currentYear } = constants;

function MainContainer() {
	const { contributionsData, inContributionsDataLists, lists } = useAppData();

	const lastDonorYear = Array.from(inContributionsDataLists.years).sort(
		(a, b) => b - a,
	)[0];

	const [year, setYear] = useState<number>(lastDonorYear || currentYear);

	void setYear;

	console.log(year);
	console.log(contributionsData);
	console.log(inContributionsDataLists);
	console.log(lists);

	return (
		<Container
			disableGutters={true}
			maxWidth={false}
			style={{
				paddingLeft: "12px",
				paddingRight: "12px",
			}}
		>
			<Tooltip
				id="tooltip"
				style={{ zIndex: 9999, maxWidth: "400px", textAlign: "center" }}
			/>
		</Container>
	);
}

export default MainContainer;
