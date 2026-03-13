import { useContext, useState, useMemo } from "react";
import DataContext, { type DataContextType } from "../context/DataContext";
import { constants } from "../utils/constants";
import Container from "@mui/material/Container";
import { Tooltip } from "react-tooltip";
import TopFilter from "./TopFilter";
import TopIntro from "./TopIntro";
import useUpdateQueryString from "../hooks/useupdatequerystring";
import processDataIndicators from "../utils/processdataindicators";
import processDataTopFigures from "../utils/processdatatopfigures";
import processDataPartners from "../utils/processdatapartners";
import processDataRegions from "../utils/processdataregions";
import processDataSectors from "../utils/processdatasectors";
import processDataStatuses from "../utils/processdatastatuses";
import TopFigures from "./TopFigures";
import Explore from "./Explore";
import Box from "@mui/material/Box";
import IndicatorsContainer from "./IndicatorsContainer";
import Partners from "./Partners";
import Regions from "./Regions";
import Sectors from "./Sectors";
import ProjectStatuses from "./Statuses";

const { charts } = constants;

export type Charts = (typeof charts)[number];

export type DownloadStates = {
	[K in Charts]: boolean;
};

const downloadStates = charts.reduce(
	(acc, chart) => ((acc[chart] = false), acc),
	{} as DownloadStates,
);

const queryStringValues = new URLSearchParams(location.search);

function MainContainer() {
	const { data, dataIndicators, inDataLists, lists } = useContext(
		DataContext,
	) as DataContextType;

	const [fund, setFund] = useState<number[]>([...inDataLists.funds]),
		[clickedDownload, setClickedDownload] =
			useState<DownloadStates>(downloadStates);
	const [status, setStatus] = useState<number[]>([
		...inDataLists.projectStatuses,
	]);

	const dataStatuses = useMemo(
		() =>
			processDataStatuses({
				data,
				fund,
				setStatus,
			}),
		[data, fund],
	);

	void clickedDownload;

	const filteredDataIndicators = useMemo(
		() =>
			processDataIndicators({
				dataIndicators,
				lists,
				fund,
				status,
			}),
		[dataIndicators, lists, fund, status],
	);

	const { dataTopFigures, inSelectionData } = useMemo(
		() =>
			processDataTopFigures({
				data,
				fund,
				status,
			}),
		[data, fund, status],
	);

	const { dataPartners, maxBudgetValue } = useMemo(
		() =>
			processDataPartners({
				data,
				fund,
				status,
			}),
		[data, fund, status],
	);

	const dataRegions = useMemo(
		() =>
			processDataRegions({
				data,
				fund,
				lists,
				status,
			}),
		[data, fund, lists, status],
	);

	const dataSectors = useMemo(
		() =>
			processDataSectors({
				data,
				fund,
				status,
			}),
		[data, fund, status],
	);

	useUpdateQueryString({
		fund,
		status,
		inDataLists,
		queryStringValues,
		setFund,
		setStatus,
		setClickedDownload,
		downloadStates,
		dataStatuses,
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
			<TopIntro />
			<TopFilter
				inSelectionData={inSelectionData}
				fund={fund}
				setFund={setFund}
				status={status}
				setStatus={setStatus}
				lists={lists}
			/>
			<ProjectStatuses
				dataStatuses={dataStatuses}
				status={status}
				setStatus={setStatus}
				lists={lists}
			/>
			<Box mb={3} />
			<TopFigures data={dataTopFigures} />
			<Box mb={8} />
			<Explore />
			<Box mb={8} />
			<IndicatorsContainer
				dataIndicators={filteredDataIndicators}
				// clickedDownload={clickedDownload}
				// setClickedDownload={setClickedDownload}
				lists={lists}
			/>
			<Box mb={8} />
			<Partners
				data={dataPartners}
				maxBudgetValue={maxBudgetValue}
				lists={lists}
				dataSectors={dataSectors}
				// clickedDownload={clickedDownload}
				// setClickedDownload={setClickedDownload}
			/>
			<Box mb={8} />
			<Regions
				data={dataRegions}
				lists={lists}
				// clickedDownload={clickedDownload}
				// setClickedDownload={setClickedDownload}
			/>
			<Box mb={8} />
			<Sectors
				data={dataSectors}
				lists={lists}
				// clickedDownload={clickedDownload}
				// setClickedDownload={setClickedDownload}
			/>
		</Container>
	);
}

export default MainContainer;
