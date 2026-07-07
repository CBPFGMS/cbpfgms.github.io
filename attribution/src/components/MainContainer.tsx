import { useState } from "react";
import Container from "@mui/material/Container";
import { useAppData } from "../hooks/useappdata";
import { constants } from "../utils/constants";
import TopSelectors from "./TopSelectors";

type MainContainerProps = {
	donor: number;
	setDonor: React.Dispatch<React.SetStateAction<number | null>>;
};

const { currentYear } = constants;

function MainContainer({ donor, setDonor }: MainContainerProps) {
	const { contributionsData, inContributionsDataLists } = useAppData();

	const [hasUS, setHasUS] = useState<boolean>(false);
	const [year, setYear] = useState<number>(currentYear);

	return (
		<Container
			disableGutters={true}
			style={{
				paddingLeft: "12px",
				paddingRight: "12px",
			}}
		>
			{/* <TopSelectors
				setYear={setYear}
				year={year}
				hasUS={hasUS}
				setHasUS={setHasUS}
				inContributionsDataLists={inContributionsDataLists}
				donor={donor}
			/> */}
		</Container>
	);
}

export default MainContainer;
