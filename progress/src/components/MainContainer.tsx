import { useContext, useState, useMemo } from "react";
import DataContext, { DataContextType } from "../context/DataContext";
import Container from "@mui/material/Container";
import { Tooltip } from "react-tooltip";
import { useInView } from "react-intersection-observer";
import constants from "../utils/constants";
import TopPanel from "./TopPanel";
import TopIntro from "./TopIntro";
import useUpdateQueryString from "../hooks/useupdatequerystring";
import FiltersContainer from "./FiltersContainer";
import processDataSummary from "../utils/processdatasummary";
import processDataStatuses from "../utils/processdatastatuses";

const { implementationStatuses, charts } = constants;

type Charts = (typeof charts)[number];

type MainContainerProps = {
	defaultYear: number;
};

export type DownloadStates = {
	[K in Charts]: boolean;
};

type RefIds = {
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

	//TODO 03: create filterArrayDownload and the download data for all charts

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
		</Container>
	);
}

export default MainContainer;
