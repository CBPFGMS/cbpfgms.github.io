import React, { useRef, useContext } from "react";
import DataContext, { type DataContextType } from "../context/DataContext";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { DatumAgencies } from "../utils/processdatasummary";
import type { List } from "../utils/makelists";
import type { DownloadStates } from "./MainContainer";
import { max } from "d3";
import BarChartRow from "./BarChartRow";
import { processAgenciesDownload } from "../utils/processdownload";
import DownloadAndImageContainer from "./DownloadAndImageContainer";
import downloadData from "../utils/downloaddata";

type AgenciesChartProps = {
	dataAgencies: DatumAgencies[];
	lists: List;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	yearSummary: number[];
	allocationSourceSummary: number[];
	countrySummary: number[];
};

function AgenciesChart({
	dataAgencies,
	lists,
	clickedDownload,
	setClickedDownload,
	yearSummary,
	countrySummary,
	allocationSourceSummary,
}: AgenciesChartProps) {
	const { data } = useContext(DataContext) as DataContextType;

	const ref = useRef<HTMLDivElement>(null);

	const sortedData = dataAgencies.sort(
		(a, b) => b.allocations - a.allocations
	);

	const maxValue = max(sortedData, d => d.allocations)!;

	function handleDownloadClick() {
		const dataAgenciesDownload = processAgenciesDownload({
			data,
			lists,
			yearSummary,
			countrySummary,
			allocationSourceSummary,
		});
		downloadData<(typeof dataAgenciesDownload)[number]>(
			dataAgenciesDownload,
			"CVA_partners"
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
				type={"agencies"}
				refElement={ref}
				fileName={"CVApartners"}
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
				Agencies
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
				{sortedData.map(d => (
					<Box
						key={d.agency}
						style={{
							width: "100%",
							display: "flex",
						}}
					>
						<BarChartRow
							type={d.agency}
							rr={d.rr}
							ufe={d.ufe}
							maxValue={maxValue}
							lists={lists}
							listProperty="organizationsAcronym"
							chartType="agencies"
						/>
					</Box>
				))}
			</Box>
		</Box>
	);
}

const memoizedAgenciesChart = React.memo(AgenciesChart);

export default memoizedAgenciesChart;
