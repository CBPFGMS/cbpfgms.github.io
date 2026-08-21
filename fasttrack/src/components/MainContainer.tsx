import { useContext, useState, useMemo, useEffect, useCallback } from "react";
import DataContext, { type DataContextType } from "../context/DataContext";
import { constants } from "../utils/constants";
import Container from "@mui/material/Container";
import { Tooltip } from "react-tooltip";
import TopFilter from "./TopFilter";
import useUpdateQueryString from "../hooks/useupdatequerystring";
import processDataIndicators from "../utils/processdataindicators";
import processDataTopFigures from "../utils/processdatatopfigures";
import processDataPartners from "../utils/processdatapartners";
import processDataRegions from "../utils/processdataregions";
import processDataSectors from "../utils/processdatasectors";
import processDataStatuses from "../utils/processdatastatuses";
import {
	processPartnersDownload,
	processRegionsDownload,
	processSectorsDownload,
} from "../utils/processdownload";
import TopFigures from "./TopFigures";
import Explore from "./Explore";
import Box from "@mui/material/Box";
import IndicatorsContainer from "./IndicatorsContainer";
import Partners from "./Partners";
import Regions from "./Regions";
import Sectors from "./Sectors";
import ProjectStatuses from "./Statuses";
import FlowContainer from "./FlowContainer";
import { processTotalBeneficiariesWithTranche } from "../utils/processtranche";
import TranchesTopCheckbox from "./TranchesTopCheckbox";

const { charts } = constants;

export type Charts = (typeof charts)[number];

export type DownloadStates = {
	[K in Charts]: boolean;
};

export type Tranche = (typeof constants.tranches)[number];

const downloadStates = charts.reduce(
	(acc, chart) => ((acc[chart] = false), acc),
	{} as DownloadStates,
);

const queryStringValues = new URLSearchParams(location.search);

function MainContainer() {
	const {
		data,
		dataIndicators,
		totalBeneficiariesData: totalBeneficiariesAllTranchesData,
		totalBeneficiariesTranche1Data,
		totalBeneficiariesTranche2Data,
		inDataLists,
		lists,
	} = useContext(DataContext) as DataContextType;

	const [fund, setFund] = useState<number[]>([...inDataLists.funds]),
		[clickedDownload, setClickedDownload] =
			useState<DownloadStates>(downloadStates);
	const [status, setStatus] = useState<number[]>([
			...inDataLists.projectStatuses,
		]),
		[sector, setSector] = useState<number[]>([...inDataLists.sectors]),
		[tranche, setTranche] = useState<Tranche>("all");

	const totalBeneficiariesData = useMemo(
		() =>
			processTotalBeneficiariesWithTranche({
				totalBeneficiariesAllTranchesData,
				totalBeneficiariesTranche1Data,
				totalBeneficiariesTranche2Data,
				tranche,
			}),
		[
			totalBeneficiariesAllTranchesData,
			totalBeneficiariesTranche1Data,
			totalBeneficiariesTranche2Data,
			tranche,
		],
	);

	const dataStatuses = useMemo(
		() =>
			processDataStatuses({
				data,
				fund,
				setStatus,
				tranche,
				inDataLists,
			}),
		[data, fund, tranche, inDataLists],
	);

	useEffect(() => {
		window.dispatchEvent(new CustomEvent("updatefunds", { detail: fund }));
	}, [fund]);

	useEffect(() => {
		window.dispatchEvent(
			new CustomEvent("updatestatuses", { detail: status }),
		);
	}, [status]);

	const filteredDataIndicators = useMemo(
		() =>
			processDataIndicators({
				dataIndicators,
				lists,
				fund,
				status,
				tranche,
				inDataLists,
			}),
		[dataIndicators, lists, fund, status, tranche, inDataLists],
	);

	const { dataTopFigures, inSelectionData } = useMemo(
		() =>
			processDataTopFigures({
				data,
				totalBeneficiariesData,
				fund,
				status,
				tranche,
				inDataLists,
			}),
		[data, totalBeneficiariesData, fund, status, tranche, inDataLists],
	);

	const { dataPartners, maxBudgetValue } = useMemo(
		() =>
			processDataPartners({
				data,
				fund,
				status,
				sector,
				tranche,
				inDataLists,
			}),
		[data, fund, status, sector, tranche, inDataLists],
	);

	const dataRegions = useMemo(
		() =>
			processDataRegions({
				data,
				fund,
				lists,
				status,
				totalBeneficiariesData,
				tranche,
				inDataLists,
			}),
		[
			data,
			fund,
			lists,
			status,
			totalBeneficiariesData,
			tranche,
			inDataLists,
		],
	);

	const dataSectors = useMemo(
		() =>
			processDataSectors({
				data,
				fund,
				status,
				setSector,
				tranche,
				inDataLists,
			}),
		[data, fund, status, tranche, inDataLists],
	);

	const dataPartnersDownload = useCallback(
		() =>
			processPartnersDownload({
				data,
				lists,
				fund,
				status,
				tranche,
				inDataLists,
			}),
		[data, lists, fund, status, tranche, inDataLists],
	);

	const dataRegionsDownload = useCallback(
		() =>
			processRegionsDownload({
				data,
				lists,
				fund,
				status,
				tranche,
				inDataLists,
			}),
		[data, lists, fund, status, tranche, inDataLists],
	);

	const dataSectorsDownload = useCallback(
		() =>
			processSectorsDownload({
				data,
				lists,
				fund,
				status,
				tranche,
				inDataLists,
			}),
		[data, lists, fund, status, tranche, inDataLists],
	);

	useUpdateQueryString({
		fund,
		status,
		tranche,
		inDataLists,
		queryStringValues,
		setFund,
		setStatus,
		setTranche,
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
			<TranchesTopCheckbox
				tranche={tranche}
				setTranche={setTranche}
			/>
			<TopFilter
				inSelectionData={inSelectionData}
				fund={fund}
				setFund={setFund}
				status={status}
				setStatus={setStatus}
				tranche={tranche}
				setTranche={setTranche}
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
			<FlowContainer />
			<Box mb={8} />
			<IndicatorsContainer
				dataIndicators={filteredDataIndicators}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				lists={lists}
			/>
			<Box mb={8} />
			<Partners
				data={dataPartners}
				maxBudgetValue={maxBudgetValue}
				lists={lists}
				dataSectors={dataSectors}
				sector={sector}
				setSector={setSector}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				dataPartnersDownload={dataPartnersDownload}
			/>
			<Box mb={8} />
			<Regions
				data={dataRegions}
				lists={lists}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				dataRegionsDownload={dataRegionsDownload}
			/>
			<Box mb={8} />
			<Sectors
				data={dataSectors}
				lists={lists}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				dataSectorsDownload={dataSectorsDownload}
			/>
		</Container>
	);
}

export default MainContainer;
