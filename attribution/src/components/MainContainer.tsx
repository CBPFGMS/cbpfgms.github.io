import { useMemo, useState } from "react";
import Container from "@mui/material/Container";
import { useAppData } from "../hooks/useappdata";
// import { constants } from "../utils/constants";
import TopSelectors from "./TopSelectors";
import DonorHeader from "./DonorHeader";
import calculateAttributions from "../utils/calculateattributions";
import { Tooltip } from "react-tooltip";
import TopAttributionCard from "./TopAttributionCard";
import AttributionCardsContainer from "./AttributionCardsContainer";

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

	const attributions = useMemo(
		() =>
			calculateAttributions({
				donor,
				contributionsData,
				year,
				hasUS,
				funds,
			}),
		[donor, contributionsData, year, hasUS, funds],
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
			<TopSelectors
				setYear={setYear}
				year={year}
				hasUS={hasUS}
				setHasUS={setHasUS}
				inContributionsDataLists={inContributionsDataLists}
				donor={donor}
				setFunds={setFunds}
			/>
			<DonorHeader
				donor={donor}
				lists={lists}
				missingFlags={inContributionsDataLists.missingFlags}
			/>
			<TopAttributionCard
				donor={donor}
				attributions={attributions}
				lists={lists}
			/>
			<AttributionCardsContainer
				attributions={attributions}
				lists={lists}
				donor={donor}
				funds={funds}
				allFunds={Array.from(
					inContributionsDataLists.fundsPerDonorAndYear[donor][year],
				)}
				setFunds={setFunds}
			/>
		</Container>
	);
}

export default MainContainer;
