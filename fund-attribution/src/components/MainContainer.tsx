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
// import getFlagSrc from "../utils/flagsrc";
import NoAttribution from "./NoAttribution";
import processLollipopData from "../utils/processlollipopdata";
// import type { AllocationsLollipopObject } from "../utils/schemas";
import LollipopContainer from "./LollipopContainer";

export type Charts = (typeof constants.charts)[number];

type MainContainerProps = {
	fund: number;
};

const { USCode } = constants;

function MainContainer({ fund }: MainContainerProps) {
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
		projectClusterData,
		allocationsLollipopData,
		allocationsLollipopWithoutUSData,
	} = useAppData();

	const lastFundYear = Array.from(inContributionsDataLists.years).sort(
		(a, b) => b - a,
	)[0];

	const [hasUS, setHasUS] = useState<boolean>(false);
	const [year, setYear] = useState<number>(lastFundYear);

	const allDonors = hasUS
		? Array.from(inContributionsDataLists.donorsPerYear[year])
		: Array.from(inContributionsDataLists.donorsPerYear[year]).filter(
				d => d !== USCode,
			);
	const [donors, setDonors] = useState<number[]>(allDonors);

	const attributions = useMemo(
		() =>
			calculateAttributions({
				contributionsData,
				year,
				hasUS,
				donors,
				allDonors,
			}),
		[contributionsData, year, hasUS, donors, allDonors],
	);

	const dataTopFigures = useMemo(
		() =>
			processDataTopFigures({
				allocationsData,
				totalBeneficiariesData,
				globalAttribution: attributions.global.percentage,
				year,
				hasUS,
			}),
		[allocationsData, totalBeneficiariesData, attributions, year, hasUS],
	);

	const dataKeyFigures = useMemo(
		() =>
			processDataKeyFigures({
				allocationsData,
				projectClusterData,
				localizationDataWithUS,
				localizationDataWithoutUS,
				globalAttribution: attributions.global.percentage,
				year,
				hasUS,
			}),
		[
			allocationsData,
			projectClusterData,
			localizationDataWithUS,
			localizationDataWithoutUS,
			attributions,
			year,
			hasUS,
		],
	);

	const targetedAndReachedTotal = useMemo(
		() =>
			processDataTotalBeneficiaries({
				totalBeneficiariesData,
				globalAttribution: attributions.global.percentage,
				year,
				hasUS,
			}),
		[totalBeneficiariesData, attributions, year, hasUS],
	);

	const { dataSector, dataOrganization } = useMemo(
		() =>
			processDataBarChart({
				allocationsData,
				year,
				totalBeneficiariesByPartnerData,
				totalBeneficiariesBySectorData,
				globalAttribution: attributions.global.percentage,
				hasUS,
			}),
		[
			allocationsData,
			year,
			totalBeneficiariesByPartnerData,
			totalBeneficiariesBySectorData,
			attributions,
			hasUS,
		],
	);

	const hasNoAttributions = attributions.global.percentage === 0;
	const hasNoData = targetedAndReachedTotal.targeted.total === 0;

	// const { flagSrc, faviconFlag } = getFlagSrc({
	// 	fund,
	// 	lists,
	// });

	const lollipopData = useMemo(
		() =>
			processLollipopData({
				allocationsLollipopData,
				allocationsLollipopWithoutUSData,
				year,
				hasUS,
				globalAttribution: attributions.global.percentage,
			}),
		[
			allocationsLollipopData,
			allocationsLollipopWithoutUSData,
			year,
			hasUS,
			attributions,
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
				fund={fund}
				setDonors={setDonors}
				lists={lists}
				donors={donors}
				attributions={attributions}
			/>
			<DonorHeader
				fund={fund}
				lists={lists}
			/>
			{hasNoAttributions ? (
				<NoAttribution
					fund={fund}
					year={year}
					lists={lists}
				/>
			) : (
				<>
					<TopAttributionCard
						fund={fund}
						attributions={attributions}
						lists={lists}
						donors={donors}
						allDonors={allDonors}
					/>
					<AttributionCardsContainer
						attributions={attributions}
						lists={lists}
						fund={fund}
						donors={donors}
						allDonors={allDonors}
						setDonors={setDonors}
					/>
				</>
			)}
			{hasNoData ? (
				<>
					<SectionDivider title="Allocations" />
					<NoData />
				</>
			) : (
				!hasNoAttributions && (
					<>
						<SectionDivider title="At a glance" />
						<TopFigures
							data={dataTopFigures}
							attribution={attributions.global.percentage}
							fundName={lists.fundNames[fund]}
						/>
						<KeyFigures
							data={dataKeyFigures}
							attribution={attributions.global.percentage}
							fundName={lists.fundNames[fund]}
						/>
						<SectionDivider title="Net funding" />
						<LollipopContainer
							fundName={lists.fundNames[fund]}
							attribution={attributions.global.percentage}
							lollipopData={lollipopData}
						/>
						<SectionDivider title="Allocated values" />
						<ChartsContainer
							targetedAndReachedTotal={targetedAndReachedTotal}
							dataSector={dataSector}
							dataOrganization={dataOrganization}
							lists={lists}
							attribution={attributions.global.percentage}
							fundName={lists.fundNames[fund]}
						/>
						<SectionDivider title="Partners" />
						<Partners
							allocationsData={allocationsData}
							year={year}
							lists={lists}
							inDataSectors={
								inAllocationsDataLists.sectorsPerYear
							}
							attribution={attributions.global.percentage}
							fundName={lists.fundNames[fund]}
							hasUS={hasUS}
						/>
						{/* <SectionDivider title="Locations" /> */}
					</>
				)
			)}
		</Container>
	);
}

export default MainContainer;
