import { useContext, useState, useMemo } from "react";
import DataContext, { DataContextType } from "../context/DataContext";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { Tooltip } from "react-tooltip";
import { useInView } from "react-intersection-observer";
import constants from "../utils/constants";
import TopPanel from "./TopPanel";
import TopIntro from "./TopIntro";
import useUpdateQueryString from "../hooks/useupdatequerystring";
import FiltersContainer from "./FiltersContainer";
import processDataSummary from "../utils/processdatasummary";
import processDataStatuses, {
	processDataStatusesBeneficiaries,
} from "../utils/processdatastatuses";
import ChartsContainer from "./ChartsContainer";
import processDataBarChart from "../utils/processdatabarchart";
import IndicatorsContainer from "./IndicatorsContainer";
import processDataTotalBeneficiaries from "../utils/processdatatotalben";
import { FundWithAllocType } from "../utils/processrawdata";

const { implementationStatuses, charts } = constants;

export type Charts = (typeof charts)[number];

type MainContainerProps = {
	defaultYear: number;
};

export type DownloadStates = {
	[K in Charts]: boolean;
};

export type RefIds = {
	[K in Charts as `${K}${typeof refIdSuffix}`]: string;
};

export type ImplementationStatuses = (typeof implementationStatuses)[number];

const downloadStates = charts.reduce(
	(acc, chart) => ((acc[chart] = false), acc),
	{} as DownloadStates,
);

const refIdSuffix = "RefId";

const refIds = charts.reduce((acc, curr) => {
	acc[`${curr}${refIdSuffix}`] = `${curr}${refIdSuffix}`;
	return acc;
}, {} as RefIds);

const queryStringValues = new URLSearchParams(location.search);

function MainContainer({ defaultYear }: MainContainerProps) {
	const {
		data,
		dataIndicators,
		inDataLists,
		lists,
		totalBeneficiariesData,
		totalBeneficiariesByPartnerData,
		totalBeneficiariesBySectorData,
		totalBeneficiariesByBeneficiaryTypeData,
		totalBeneficiariesByDisabilityData,
		totalBeneficiariesWithAllocTypeData,
		totalBeneficiariesByPartnerWithAllocTypeData,
		totalBeneficiariesBySectorWithAllocTypeData,
		totalBeneficiariesByBeneficiaryTypeWithAllocTypeData,
		totalBeneficiariesByDisabilityWithAllocTypeData,
	} = useContext(DataContext) as DataContextType;

	const [year, setYear] = useState<number[]>([defaultYear]),
		[fund, setFund] = useState<number[]>([...inDataLists.funds]),
		[allocationType, setAllocationType] = useState<FundWithAllocType[]>([
			...inDataLists.allocationTypes,
		]),
		[allocationSource, setAllocationSource] = useState<number[]>([
			...inDataLists.allocationSources,
		]),
		[implementationStatus, setImplementationStatus] = useState<
			ImplementationStatuses[]
		>([...inDataLists.statuses]),
		[clickedDownload, setClickedDownload] =
			useState<DownloadStates>(downloadStates);

	const [titleRef, inViewTitle] = useInView({
			threshold: 0.999,
		}),
		[menusRef, inViewMenus] = useInView({
			threshold: 0,
		});

	const chartsThreshold = { threshold: 0.9 };

	const [summaryRef, inViewSummary] = useInView(chartsThreshold);
	const [pictogramRef, inViewPictogram] = useInView(chartsThreshold);
	const [beneficiaryTypesRef, inViewBeneficiaryTypes] =
		useInView(chartsThreshold);
	const [sectorsRef, inViewSectors] = useInView(chartsThreshold);
	const [organizationsRef, inViewOrganizations] = useInView(chartsThreshold);
	const [disabilityRef, inViewDisability] = useInView(chartsThreshold);
	const [emergenciesRef, inViewEmergencies] = useInView(chartsThreshold);
	const [gbvRef, inViewGBV] = useInView(chartsThreshold);
	const [cashRef, inViewCash] = useInView(chartsThreshold);
	const [indicatorsRef, inViewIndicators] = useInView(chartsThreshold);

	const allStatusesSelected =
		inDataLists.statuses.size === implementationStatus.length;
	const allAllocationTypesSelected =
		inDataLists.allocationTypes.size === allocationType.length;
	const allSourcesSelected =
		inDataLists.allocationSources.size === allocationSource.length;

	const targetedAndReachedTotal = useMemo(
		() =>
			processDataTotalBeneficiaries({
				totalBeneficiariesData,
				totalBeneficiariesWithAllocTypeData,
				year,
				fund,
				implementationStatus,
				lists,
				allocationSource,
				allocationType,
				allStatusesSelected,
				allAllocationTypesSelected,
				allSourcesSelected,
			}),
		[
			totalBeneficiariesData,
			totalBeneficiariesWithAllocTypeData,
			year,
			fund,
			implementationStatus,
			lists,
			allocationSource,
			allocationType,
			allStatusesSelected,
			allAllocationTypesSelected,
			allSourcesSelected,
		],
	);

	const targetedAndReachedTotalByDisability = useMemo(
		() =>
			processDataTotalBeneficiaries({
				totalBeneficiariesData: totalBeneficiariesByDisabilityData,
				totalBeneficiariesWithAllocTypeData:
					totalBeneficiariesByDisabilityWithAllocTypeData,
				year,
				fund,
				implementationStatus,
				lists,
				allocationSource,
				allocationType,
				allStatusesSelected,
				allAllocationTypesSelected,
				allSourcesSelected,
			}),
		[
			totalBeneficiariesByDisabilityData,
			totalBeneficiariesByDisabilityWithAllocTypeData,
			year,
			fund,
			implementationStatus,
			lists,
			allocationSource,
			allocationType,
			allStatusesSelected,
			allAllocationTypesSelected,
			allSourcesSelected,
		],
	);

	const dataStatuses = useMemo(
		() =>
			processDataStatuses({
				data,
				year,
				fund,
				allocationSource,
				allocationType,
				lists,
			}),
		[data, year, fund, allocationSource, allocationType, lists],
	);

	const dataStatusesBeneficiaries = useMemo(
		() =>
			processDataStatusesBeneficiaries({
				totalBeneficiariesData,
				totalBeneficiariesWithAllocTypeData,
				year,
				fund,
				allocationSource,
				allocationType,
				lists,
				allAllocationTypesSelected,
				allSourcesSelected,
			}),
		[
			totalBeneficiariesData,
			totalBeneficiariesWithAllocTypeData,
			year,
			fund,
			allocationSource,
			allocationType,
			lists,
			allAllocationTypesSelected,
			allSourcesSelected,
		],
	);

	const {
		dataSummary,
		dataEmergency,
		dataCva,
		dataCvaTotalPeople,
		dataGBV,
		inSelectionData,
		disabilityReports,
	} = useMemo(
		() =>
			processDataSummary({
				data,
				year,
				fund,
				allocationSource,
				allocationType,
				implementationStatus,
				lists,
			}),
		[
			data,
			year,
			fund,
			allocationSource,
			allocationType,
			implementationStatus,
			lists,
		],
	);

	const { dataBeneficiaryByType, dataSector, dataOrganization } = useMemo(
		() =>
			processDataBarChart({
				data,
				year,
				fund,
				allocationSource,
				allocationType,
				implementationStatus,
				lists,
				totalBeneficiariesByPartnerData,
				totalBeneficiariesBySectorData,
				totalBeneficiariesByBeneficiaryTypeData,
				totalBeneficiariesByPartnerWithAllocTypeData,
				totalBeneficiariesBySectorWithAllocTypeData,
				totalBeneficiariesByBeneficiaryTypeWithAllocTypeData,
				inDataLists,
				allStatusesSelected,
				allSourcesSelected,
				allAllocationTypesSelected,
			}),
		[
			data,
			year,
			fund,
			allocationSource,
			allocationType,
			implementationStatus,
			lists,
			totalBeneficiariesByPartnerData,
			totalBeneficiariesBySectorData,
			totalBeneficiariesByBeneficiaryTypeData,
			totalBeneficiariesByPartnerWithAllocTypeData,
			totalBeneficiariesBySectorWithAllocTypeData,
			totalBeneficiariesByBeneficiaryTypeWithAllocTypeData,
			inDataLists,
			allStatusesSelected,
			allSourcesSelected,
			allAllocationTypesSelected,
		],
	);

	useUpdateQueryString({
		allocationSource,
		allocationType,
		fund,
		implementationStatus,
		inDataLists,
		queryStringValues,
		setAllocationSource,
		setAllocationType,
		setClickedDownload,
		setFund,
		setImplementationStatus,
		setYear,
		year,
		downloadStates,
		defaultYear,
	});

	const filterProps = {
		year,
		setYear,
		fund,
		setFund,
		allocationSource,
		setAllocationSource,
		allocationType,
		setAllocationType,
		inSelectionData,
	};

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
			<TopPanel
				{...filterProps}
				implementationStatus={implementationStatus}
				setImplementationStatus={setImplementationStatus}
				titleRef={titleRef}
				inViewTitle={inViewTitle}
				inViewMenus={inViewMenus}
				inViewSummary={inViewSummary}
				inViewPictogram={inViewPictogram}
				inViewBeneficiaryTypes={inViewBeneficiaryTypes}
				inViewOrganizations={inViewOrganizations}
				inViewSectors={inViewSectors}
				inViewEmergencies={inViewEmergencies}
				inViewIndicators={inViewIndicators}
				inViewDisability={inViewDisability}
				inViewGBV={inViewGBV}
				inViewCash={inViewCash}
				refIds={refIds}
			/>
			<TopIntro />
			<FiltersContainer
				{...filterProps}
				implementationStatus={implementationStatus}
				setImplementationStatus={setImplementationStatus}
				menusRef={menusRef}
				dataStatuses={dataStatuses}
				dataStatusesBeneficiaries={dataStatusesBeneficiaries}
			/>
			<Box
				mt={4}
				mb={4}
			/>
			<ChartsContainer
				dataSummary={dataSummary}
				targetedAndReachedTotal={targetedAndReachedTotal}
				dataBeneficiaryByType={dataBeneficiaryByType}
				dataSector={dataSector}
				dataOrganization={dataOrganization}
				targetedAndReachedTotalByDisability={
					targetedAndReachedTotalByDisability
				}
				dataEmergency={dataEmergency}
				dataGBV={dataGBV}
				dataCva={dataCva}
				dataCvaTotalPeople={dataCvaTotalPeople}
				setClickedDownload={setClickedDownload}
				clickedDownload={clickedDownload}
				lists={lists}
				refIds={refIds}
				summaryRef={summaryRef}
				pictogramRef={pictogramRef}
				beneficiaryTypesRef={beneficiaryTypesRef}
				sectorsRef={sectorsRef}
				organizationsRef={organizationsRef}
				emergenciesRef={emergenciesRef}
				disabilityRef={disabilityRef}
				gbvRef={gbvRef}
				cashRef={cashRef}
				year={year}
				fund={fund}
				allocationSource={allocationSource}
				allocationType={allocationType}
				implementationsStatus={implementationStatus}
				disabilityReports={disabilityReports}
			/>
			<IndicatorsContainer
				dataIndicators={dataIndicators}
				year={year}
				fund={fund}
				allocationSource={allocationSource}
				allocationType={allocationType}
				indicatorsRef={indicatorsRef}
				refIds={refIds}
				lists={lists}
				setClickedDownload={setClickedDownload}
				clickedDownload={clickedDownload}
				implementationsStatus={implementationStatus}
			/>
		</Container>
	);
}

export default MainContainer;
