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
import NoData from "./NoData";
import getFlagSrc from "../utils/flagsrc";

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
		localizationDataWithUS,
		localizationDataWithoutUS,
	} = useAppData();

	const lastDonorYear = Array.from(inContributionsDataLists.years).sort(
		(a, b) => b - a,
	)[0];

	const [hasUS, setHasUS] = useState<boolean>(donor === USCode);
	const [year, setYear] = useState<number>(lastDonorYear);

	const allFunds = Array.from(inContributionsDataLists.fundsPerYear[year]);
	const [funds, setFunds] = useState<number[]>(allFunds);

	const attributions = useMemo(
		() =>
			calculateAttributions({
				contributionsData,
				year,
				hasUS,
				funds,
				allFunds,
			}),
		[contributionsData, year, hasUS, funds, allFunds],
	);

	const dataTopFigures = useMemo(
		() =>
			processDataTopFigures({
				allocationsData,
				totalBeneficiariesData,
				funds,
				globalAttribution: attributions.global.percentage,
				year,
				hasUS,
			}),
		[
			allocationsData,
			totalBeneficiariesData,
			funds,
			attributions,
			year,
			hasUS,
		],
	);

	const dataKeyFigures = useMemo(
		() =>
			processDataKeyFigures({
				allocationsData,
				localizationDataWithUS,
				localizationDataWithoutUS,
				funds,
				globalAttribution: attributions.global.percentage,
				lists,
				year,
				hasUS,
			}),
		[
			allocationsData,
			localizationDataWithUS,
			localizationDataWithoutUS,
			funds,
			attributions,
			lists,
			year,
			hasUS,
		],
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
				globalAttribution: attributions.global.percentage,
				hasUS,
			}),
		[
			allocationsData,
			year,
			funds,
			totalBeneficiariesByPartnerData,
			totalBeneficiariesBySectorData,
			attributions,
			hasUS,
		],
	);

	const hasNoData = targetedAndReachedTotal.targeted.total === 0;

	const { flagSrc, faviconFlag } = getFlagSrc({
		donor,
		lists,
	});

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
				lists={lists}
				funds={funds}
				attributions={attributions}
				flagSrc={flagSrc}
			/>
			<DonorHeader
				donor={donor}
				lists={lists}
				flagSrc={flagSrc}
				faviconFlag={faviconFlag}
			/>
			<TopAttributionCard
				donor={donor}
				attributions={attributions}
				lists={lists}
				funds={funds}
				allFunds={allFunds}
			/>
			<AttributionCardsContainer
				attributions={attributions}
				lists={lists}
				donor={donor}
				funds={funds}
				allFunds={allFunds}
				setFunds={setFunds}
			/>
			{hasNoData ? (
				<>
					<SectionDivider title="Allocations" />
					<NoData />
				</>
			) : (
				<>
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
						donorName={lists.donorGMSNames[donor]}
						hasUS={hasUS}
					/>
					{/* <SectionDivider title="Locations" /> */}
				</>
			)}
		</Container>
	);
}

export default MainContainer;
