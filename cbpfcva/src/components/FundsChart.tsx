import React, { useContext, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import type { DatumFunds } from "../utils/processdata";
import type { List } from "../utils/makelists";
import type { DownloadStates } from "./MainContainer";
import DataContext, { type DataContextType } from "../context/DataContext";
import { max } from "d3";
import downloadData from "../utils/downloaddata";
import { processFundsDownload } from "../utils/processdownload";
import DownloadAndImageContainer from "./DownloadAndImageContainer";
import colors from "../utils/colors";
import BarChartRow from "./BarChartRow";
import type { InDataLists } from "../utils/processrawdata";
import constants from "../utils/constants";
import InfoIcon from "@mui/icons-material/Info";

type FundsChartProps = {
	data: DatumFunds[];
	lists: List;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	year: number[];
	fund: number[];
	organizationType: number[];
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	inDataLists: InDataLists;
};

const { unselectedFundOpacity } = constants;

function FundsChart({
	data,
	lists,
	clickedDownload,
	setClickedDownload,
	year,
	fund,
	organizationType,
	setFund,
	inDataLists,
}: FundsChartProps) {
	const { data: completeData } = useContext(DataContext) as DataContextType;

	const ref = useRef<HTMLDivElement>(null);

	const maxValue = max(
		data.map(d => Math.max(d.totalAllocations, d.cvaAllocations))
	) as number;

	function handleDownloadClick() {
		const dataFundsDownload = processFundsDownload({
			data: completeData,
			lists,
			year,
			fund,
			organizationType,
		});
		downloadData<(typeof dataFundsDownload)[number]>(
			dataFundsDownload,
			"cva_by_funds"
		);
	}

	function handleFundClick(thisFund: number) {
		if (fund.length === inDataLists.funds.size) {
			setFund([thisFund]);
		} else if (fund.length === 1 && fund.includes(thisFund)) {
			setFund([...inDataLists.funds]);
		} else {
			if (fund.includes(thisFund)) {
				setFund(fund.filter(f => f !== thisFund));
			} else {
				setFund(prevFund => [...prevFund, thisFund]);
			}
		}
	}

	return (
		<Container
			disableGutters={true}
			style={{
				position: "relative",
			}}
			ref={ref}
		>
			<DownloadAndImageContainer
				handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type={"funds"}
				refElement={ref}
				fileName={"funds"}
			/>
			<Box
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "58px",
					flexDirection: "column",
				}}
				mb={2}
			>
				<Box
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexDirection: "row",
					}}
				>
					<Typography
						style={{
							fontSize: "1rem",
							fontWeight: 500,
							textTransform: "uppercase",
							position: "relative",
						}}
					>
						Total and CVA allocations by Fund
						<InfoIcon
							data-tooltip-id="tooltip"
							data-tooltip-content={
								"Click on a fund to select or deselect that fund (deselecting the only selected fund selects all funds). Only selected funds data will be displayed on the 'Allocations by CVA Type' chart. You can select more than 1 fund."
							}
							data-tooltip-place="top"
							style={{
								color: colors.unColor,
								fontSize: "20px",
								marginLeft: "0.1em",
								marginTop: "-0.4em",
								alignSelf: "flex-start",
								position: "absolute",
							}}
						/>
					</Typography>
				</Box>
				<Typography
					style={{
						fontSize: "0.8rem",
						display: "flex",
						alignItems: "baseline",
						marginTop: "-0.5em",
					}}
				>
					{"("}
					<span
						style={{
							fontSize: 22,
							marginLeft: 3,
							marginRight: 3,
							color: colors.totalAllocationsColor,
						}}
					>
						{"\u25A0"}
					</span>
					Total allocations
					<span
						style={{
							fontSize: 22,
							marginLeft: 6,
							marginRight: 3,
							color: colors.cvaAllocationsColor,
							opacity: 0.6,
						}}
					>
						{"\u25A0"}
					</span>
					CVA allocations
					{")"}
				</Typography>
			</Box>
			<Box
				display={"flex"}
				flexDirection={"column"}
				width={"95%"}
				marginLeft={"3%"}
				alignItems={"center"}
				gap={2}
				marginTop={2}
			>
				<Box
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "flex-end",
						textAlign: "right",
						width: "100%",
					}}
				>
					<Typography
						variant="body2"
						fontSize={12}
						style={{
							color: "#222",
							border: "none",
							fontStyle: "italic",
							letterSpacing: "-0.05em",
						}}
					>
						CVA as %<br />
						of total
					</Typography>
				</Box>
				{data.map(d => (
					<Box
						style={{
							width: "100%",
							opacity: fund.includes(d.fund)
								? 1
								: unselectedFundOpacity,
							cursor: "pointer",
						}}
						onClick={() => handleFundClick(d.fund)}
						key={d.fund}
					>
						<BarChartRow
							key={d.fund}
							typeId={d.fund}
							valueA={d.totalAllocations}
							valueB={d.cvaAllocations}
							colorA={colors.totalAllocationsColor}
							colorB={colors.cvaAllocationsColor}
							maxValue={maxValue}
							listProperty={lists.fundNames}
							chartType={"funds"}
							fromFunds={true}
						/>
					</Box>
				))}
			</Box>
		</Container>
	);
}

const MemoisedFundsChart = React.memo(FundsChart);

export default MemoisedFundsChart;
