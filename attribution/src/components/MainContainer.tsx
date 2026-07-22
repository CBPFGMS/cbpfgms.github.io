import { useMemo, useState } from "react";
import Container from "@mui/material/Container";
import { useAppData } from "../hooks/useappdata";
import { constants } from "../utils/constants";
import TopSelectors from "./TopSelectors";
import DonorHeader from "./DonorHeader";
import calculateAttributions from "../utils/calculateattributions";
import { Tooltip } from "react-tooltip";
import TopAttributionCard from "./TopAttributionCard";
import AttributionCardsContainer from "./AttributionCardsContainer";
import SectionDivider from "./SectionDivider";
import processDataTopFigures from "../utils/processdatatopfigures";
import TopFigures from "./TopFigures";
import KeyFigures from "./KeyFigures";
import processDataKeyFigures from "../utils/processdatakeyfigures";
import processDataTotalBeneficiaries from "../utils/processdatatotalben";
import processDataBarChart from "../utils/processdatabarchart";
import ChartsContainer from "./ChartsContainer";
import Partners from "./Partners";

export type Charts = (typeof constants.charts)[number];

type MainContainerProps = {
	donor: number;
};

const { USCode } = constants;

function MainContainer({ donor }: MainContainerProps) {
	const {
		contributionsData,
		inContributionsDataLists,
		lists,
		allocationsData,
		inAllocationsDataLists,
		totalBeneficiariesData,
		totalBeneficiariesByPartnerData,
		totalBeneficiariesBySectorData,
	} = useAppData();

	const lastDonorYear = Array.from(
		inContributionsDataLists.yearsPerDonor[donor],
	).sort((a, b) => b - a)[0];

	const [hasUS, setHasUS] = useState<boolean>(donor === USCode);
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
				allFunds: Array.from(
					inContributionsDataLists.fundsPerDonorAndYear[donor][year],
				),
			}),
		[
			donor,
			contributionsData,
			year,
			hasUS,
			funds,
			inContributionsDataLists,
		],
	);

	const dataTopFigures = useMemo(
		() =>
			processDataTopFigures({
				allocationsData,
				totalBeneficiariesData,
				funds,
				globalAttribution: attributions.global.percentage,
				year,
			}),
		[allocationsData, totalBeneficiariesData, funds, attributions, year],
	);

	const dataKeyFigures = useMemo(
		() =>
			processDataKeyFigures({
				allocationsData,
				funds,
				globalAttribution: attributions.global.percentage,
				lists,
				year,
			}),
		[allocationsData, funds, attributions, lists, year],
	);

	const targetedAndReachedTotal = useMemo(
		() =>
			processDataTotalBeneficiaries({
				totalBeneficiariesData,
				funds,
				globalAttribution: attributions.global.percentage,
				year,
			}),
		[totalBeneficiariesData, funds, attributions, year],
	);

	const { dataSector, dataOrganization } = useMemo(
		() =>
			processDataBarChart({
				allocationsData,
				year,
				funds,
				totalBeneficiariesByPartnerData,
				totalBeneficiariesBySectorData,
			}),
		[
			allocationsData,
			year,
			funds,
			totalBeneficiariesByPartnerData,
			totalBeneficiariesBySectorData,
		],
	);

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
				funds={funds}
				allFunds={Array.from(
					inContributionsDataLists.fundsPerDonorAndYear[donor][year],
				)}
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
			<SectionDivider title="At a glance" />
			<TopFigures
				data={dataTopFigures}
				attribution={attributions.global.percentage}
				donorName={lists.donorGMSNames[donor]}
			/>
			<KeyFigures
				data={dataKeyFigures}
				attribution={attributions.global.percentage}
				donorName={lists.donorGMSNames[donor]}
			/>
			<SectionDivider title="Allocated values" />
			<ChartsContainer
				targetedAndReachedTotal={targetedAndReachedTotal}
				dataSector={dataSector}
				dataOrganization={dataOrganization}
				lists={lists}
				attribution={attributions.global.percentage}
				donorName={lists.donorGMSNames[donor]}
			/>
			<SectionDivider title="Partners" />
			<Partners
				allocationsData={allocationsData}
				funds={funds}
				year={year}
				lists={lists}
				inDataSectors={inAllocationsDataLists.sectorsPerYear}
				attribution={attributions.global.percentage}
			/>
			<SectionDivider title="Locations" />
		</Container>
	);
}

export default MainContainer;
