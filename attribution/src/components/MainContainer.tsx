import { useState } from "react";
import Container from "@mui/material/Container";
import { useAppData } from "../hooks/useappdata";
import { constants } from "../utils/constants";
import TopSelectors from "./TopSelectors";
import DonorHeader from "./DonorHeader";

type MainContainerProps = {
	donor: number;
};

function MainContainer({ donor }: MainContainerProps) {
	const { contributionsData, inContributionsDataLists, lists } = useAppData();

	const lastDonorYear = Array.from(
		inContributionsDataLists.yearsPerDonor[donor],
	).sort((a, b) => b - a)[0];

	const [hasUS, setHasUS] = useState<boolean>(false);
	const [year, setYear] = useState<number>(lastDonorYear);
	const [funds, setFunds] = useState<number[]>(
		Array.from(inContributionsDataLists.fundsPerDonorAndYear[donor][year]),
	);

	return (
		<Container
			disableGutters={true}
			style={{
				paddingLeft: "12px",
				paddingRight: "12px",
			}}
		>
			<TopSelectors
				setYear={setYear}
				year={year}
				hasUS={hasUS}
				setHasUS={setHasUS}
				inContributionsDataLists={inContributionsDataLists}
				donor={donor}
			/>
			<DonorHeader
				donor={donor}
				lists={lists}
				missingFlags={inContributionsDataLists.missingFlags}
			/>
		</Container>
	);
}

export default MainContainer;
