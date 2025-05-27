import React, { useRef, useContext } from "react";
import DataContext, { type DataContextType } from "../context/DataContext";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { DatumTypes } from "../utils/processdatasummary";
import type { List } from "../utils/makelists";
import type { DownloadStates } from "./MainContainer";
import { max, sum } from "d3";
import BarChartRow from "./BarChartRow";
import { processCvaTypeDownload } from "../utils/processdownload";
import DownloadAndImageContainer from "./DownloadAndImageContainer";
import downloadData from "../utils/downloaddata";

type TypesChartProps = {
	dataTypes: DatumTypes[];
	lists: List;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	yearSummary: number[];
	allocationSourceSummary: number[];
	countrySummary: number[];
};

function TypesChart({
	dataTypes,
	lists,
	clickedDownload,
	setClickedDownload,
	yearSummary,
	countrySummary,
	allocationSourceSummary,
}: TypesChartProps) {
	const { data } = useContext(DataContext) as DataContextType;

	const ref = useRef<HTMLDivElement>(null);

	const sortedData = dataTypes.sort((a, b) => b.allocations - a.allocations);

	const totalCva = sum(sortedData, d => d.allocations);

	const maxValue = max(sortedData, d => d.allocations)!;

	function handleDownloadClick() {
		const dataTypesDownload = processCvaTypeDownload({
			data,
			lists,
			yearSummary,
			countrySummary,
			allocationSourceSummary,
		});
		downloadData<(typeof dataTypesDownload)[number]>(
			dataTypesDownload,
			"CVA_types"
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
			mt={3}
			ref={ref}
		>
			<DownloadAndImageContainer
				handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type={"types"}
				refElement={ref}
				fileName={"CVAtypes"}
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
				CVA Types
			</Typography>
			<Box
				display={"flex"}
				flexDirection={"column"}
				width={"95%"}
				marginLeft={"3%"}
				alignItems={"center"}
				gap={2}
				mt={1}
			>
				<Box
					width={"100%"}
					mb={-1}
				>
					<Typography
						marginLeft={"21%"}
						variant="body2"
						fontSize={12}
						style={{
							color: "#222",
							border: "none",
							fontStyle: "italic",
							letterSpacing: "-0.05em",
						}}
					>
						% of total CVA
					</Typography>
				</Box>
				{sortedData.map(d => (
					<Box
						key={d.cvaType}
						style={{
							width: "100%",
							display: "flex",
						}}
					>
						<BarChartRow
							type={d.cvaType}
							rr={d.rr}
							ufe={d.ufe}
							maxValue={maxValue}
							list={lists.cvaTypeNames}
							chartType="types"
							fromCva={true}
							totalCvaPercentage={Math.round(
								(100 * d.allocations) / totalCva
							)}
						/>
					</Box>
				))}
			</Box>
		</Box>
	);
}

const memoizedTypesChart = React.memo(TypesChart);

export default memoizedTypesChart;
