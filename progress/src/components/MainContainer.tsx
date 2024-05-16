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
import processDataStatuses from "../utils/processdatastatuses";
import ChartsContainer from "./ChartsContainer";
import processDataBeneficiaryByType from "../utils/processdatabeneficiarybytype";

const { implementationStatuses, charts } = constants;

type Charts = (typeof charts)[number];

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

const downloadStates: DownloadStates = {
	summary: false,
	pictogram: false,
	beneficiaryTypes: false,
	sectors: false,
	organization: false,
} as const;

const refIdSuffix = "RefId";

const refIds = (Object.keys(downloadStates) as Charts[]).reduce((acc, curr) => {
	acc[`${curr}${refIdSuffix}`] = `${curr}${refIdSuffix}`;
	return acc;
}, {} as RefIds);

const queryStringValues = new URLSearchParams(location.search);

function MainContainer({ defaultYear }: MainContainerProps) {
	const { data, inDataLists, lists } = useContext(
		DataContext
	) as DataContextType;

	const [year, setYear] = useState<number[]>([defaultYear]),
		[fund, setFund] = useState<number[]>([...inDataLists.funds]),
		[allocationType, setAllocationType] = useState<number[]>([
			...inDataLists.allocationTypes,
		]),
		[allocationSource, setAllocationSource] = useState<number[]>([
			...inDataLists.allocationSources,
		]),
		[implementationStatus, setImplementationStatus] = useState<
			ImplementationStatuses[]
		>([...implementationStatuses]),
		[clickedDownload, setClickedDownload] =
			useState<DownloadStates>(downloadStates);

	const [titleRef, inViewTitle] = useInView({
			threshold: 0.999,
		}),
		[menusRef, inViewMenus] = useInView({
			threshold: 0,
		});

	const chartsThreshold = {
		threshold: 0.9,
	};

	const [summaryRef, inViewSummary] = useInView(chartsThreshold);
	const [pictogramRef, inViewPictogram] = useInView(chartsThreshold);
	const [beneficiaryTypesRef, inViewBeneficiaryTypes] =
		useInView(chartsThreshold);

	//TODO 01: All the refs and inViews using useInView

	//TODO 02: process data for all charts
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
		[data, year, fund, allocationSource, allocationType, lists]
	);

	const { dataSummary, dataPictogram, inSelectionData } = useMemo(
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
		]
	);

	const dataBeneficiaryByType = useMemo(
		() =>
			processDataBeneficiaryByType({
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
		]
	);

	//TODO 03: create filterArrayDownload and the download data for all charts

	//TODO 04: add the scrollspy for the top panel

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
				titleRef={titleRef}
				inViewTitle={inViewTitle}
				inViewMenus={inViewMenus}
			/>
			<TopIntro />
			<FiltersContainer
				year={year}
				setYear={setYear}
				fund={fund}
				setFund={setFund}
				allocationSource={allocationSource}
				setAllocationSource={setAllocationSource}
				allocationType={allocationType}
				setAllocationType={setAllocationType}
				implementationStatus={implementationStatus}
				setImplementationStatus={setImplementationStatus}
				inSelectionData={inSelectionData}
				menusRef={menusRef}
				dataStatuses={dataStatuses}
			/>
			<Box
				mt={4}
				mb={4}
			/>
			<ChartsContainer
				dataSummary={dataSummary}
				dataPictogram={dataPictogram}
				dataBeneficiaryByType={dataBeneficiaryByType}
				setClickedDownload={setClickedDownload}
				clickedDownload={clickedDownload}
				lists={lists}
				refIds={refIds}
				summaryRef={summaryRef}
				pictogramRef={pictogramRef}
				beneficiaryTypesRef={beneficiaryTypesRef}
			/>
		</Container>
	);
}

export default MainContainer;
