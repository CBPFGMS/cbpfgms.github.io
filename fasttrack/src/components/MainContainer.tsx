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
import TopFigures from "./TopFigures";
import Explore from "./Explore";
import Box from "@mui/material/Box";
import IndicatorsContainer from "./IndicatorsContainer";

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

	const filteredDataIndicators = useMemo(
		() =>
			processDataIndicators({
				dataIndicators,
				lists,
				fund,
			}),
		[dataIndicators, lists, fund],
	);

	const { dataTopFigures, inSelectionData } = useMemo(
		() =>
			processDataTopFigures({
				data,
				fund,
			}),
		[data, fund],
	);

	useUpdateQueryString({
		fund,
		inDataLists,
		queryStringValues,
		setFund,
		setClickedDownload,
		downloadStates,
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
			/>
			<TopFigures data={dataTopFigures} />
			<Box mb={3} />
			<Explore />
			<Box mb={3} />
			<IndicatorsContainer
				dataIndicators={filteredDataIndicators}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				fund={fund}
				lists={lists}
			/>
		</Container>
	);
}

export default MainContainer;
