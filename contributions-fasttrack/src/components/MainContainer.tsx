import { useMemo, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { useAppData } from "../hooks/useappdata";
import { constants } from "../utils/constants";
import { Tooltip } from "react-tooltip";
import TopSelectors from "./TopSelector";
import processTopValues from "../utils/processtopvalues";
import ContributionCardsContainer from "./ContributionCardsContainer";
import processContributions from "../utils/processcontributions";
import Chart from "./Chart";

const { currentYear, contributionTypes } = constants;

export type Tranche = (typeof constants.tranches)[number];

export type ContributionType = (typeof constants.contributionTypes)[number];

function MainContainer() {
	const { contributionsData, inContributionsDataLists, lists } = useAppData();

	const yearsAsArray = Array.from(inContributionsDataLists.years).sort(
		(a, b) => a - b,
	);

	const lastDonorYear = yearsAsArray.at(-1);

	const [year, setYear] = useState<number>(lastDonorYear || currentYear);
	const [tranche, setTranche] = useState<Tranche>("all");
	const [contributionType, setContributionType] = useState<ContributionType>(
		contributionTypes[0],
	);
	const [isStacked, setIsStacked] = useState<boolean>(false);

	const topValuesData = useMemo(
		() =>
			processTopValues({
				contributionsData,
				lists,
				year,
				tranche,
			}),
		[contributionsData, lists, year, tranche],
	);

	const data = useMemo(
		() =>
			processContributions({
				contributionsData,
				year,
				tranche,
			}),
		[contributionsData, year, tranche],
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
				style={{
					zIndex: 9999,
					maxWidth: "400px",
					textAlign: "center",
					whiteSpace: "pre-line",
				}}
			/>
			<Box sx={{ mb: 3 }} />
			<TopSelectors
				tranche={tranche}
				setTranche={setTranche}
				year={year}
				setYear={setYear}
				yearsAsArray={yearsAsArray}
			/>
			<Box sx={{ mb: 3 }} />
			<ContributionCardsContainer
				topValuesData={topValuesData}
				contributionType={contributionType}
				setContributionType={setContributionType}
				lists={lists}
				isStacked={isStacked}
				setIsStacked={setIsStacked}
			/>
			<Box sx={{ mb: 5 }} />
			<Chart
				data={data}
				isStacked={isStacked}
				contributionType={contributionType}
			/>
		</Container>
	);
}

export default MainContainer;
