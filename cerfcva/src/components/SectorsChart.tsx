import React, { useRef, useContext } from "react";
import DataContext, { type DataContextType } from "../context/DataContext";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { DatumSectors } from "../utils/processdatasummary";
import type { List } from "../utils/makelists";
import type { DownloadStates } from "./MainContainer";
import { max } from "d3";
import BarChartRow from "./BarChartRow";
import { processSectorsDownload } from "../utils/processdownload";
import DownloadAndImageContainer from "./DownloadAndImageContainer";
import downloadData from "../utils/downloaddata";

type SectorsChartProps = {
	dataSectors: DatumSectors[];
	lists: List;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	yearSummary: number[];
	allocationSourceSummary: number[];
	countrySummary: number[];
};

function SectorsChart({
	dataSectors,
	lists,
	clickedDownload,
	setClickedDownload,
	yearSummary,
	countrySummary,
	allocationSourceSummary,
}: SectorsChartProps) {
	const { data } = useContext(DataContext) as DataContextType;

	const ref = useRef<HTMLDivElement>(null);

	const sortedData = dataSectors.sort(
		(a, b) => b.allocations - a.allocations
	);

	const maxValue = max(sortedData, d => d.allocations)!;

	function handleDownloadClick() {
		const dataSectorsDownload = processSectorsDownload({
			data,
			lists,
			yearSummary,
			countrySummary,
			allocationSourceSummary,
		});
		downloadData<(typeof dataSectorsDownload)[number]>(
			dataSectorsDownload,
			"CVA_sectors"
		);
	}

	return (
		<Box
			style={{
				display: "flex",
				alignItems: "flex-start",
				justifyContent: "center",
				flexDirection: "column",
				width: "100%",
				position: "relative",
			}}
			pt={3}
			pb={1}
			ref={ref}
		>
			<DownloadAndImageContainer
				handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type={"sectors"}
				refElement={ref}
				fileName={"CVAsectors"}
			/>
			<Typography
				variant={"h4"}
				mb={3}
				ml={1}
				style={{
					fontFamily: "Roboto",
					fontSize: "24px",
					fontWeight: 700,
					color: "#111",
				}}
			>
				Sectors
			</Typography>
			<Box
				display={"flex"}
				flexDirection={"column"}
				width={"95%"}
				marginLeft={"3%"}
				alignItems={"center"}
				gap={1}
				mt={1}
			>
				{sortedData.map(d => (
					<Box
						key={d.sector}
						style={{
							width: "100%",
							display: "flex",
						}}
					>
						<BarChartRow
							type={d.sector}
							rr={d.rr}
							ufe={d.ufe}
							maxValue={maxValue}
							lists={lists}
							listProperty="sectors"
							chartType="sectors"
						/>
					</Box>
				))}
			</Box>
		</Box>
	);
}

const memoizedSectorsChart = React.memo(SectorsChart);

export default memoizedSectorsChart;
