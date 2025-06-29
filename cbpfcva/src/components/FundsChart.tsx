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

type FundsChartProps = {
	data: DatumFunds[];
	lists: List;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	year: number[];
	fund: number[];
	allocationSource: number[];
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
};

function FundsChart({
	data,
	lists,
	clickedDownload,
	setClickedDownload,
	year,
	fund,
	allocationSource,
	setFund,
}: FundsChartProps) {
	const { data: completeData } = useContext(DataContext) as DataContextType;

	const ref = useRef<HTMLDivElement>(null);

	const maxValue = max(
		data.map(d => Math.max(d.totalAllocations, d.cvaAllocations))
	) as number;

	function handleDownloadClick() {
		const dataBeneficiariesDownload = processFundsDownload({
			data: completeData,
			lists,
			year,
			fund,
			allocationSource,
		});
		downloadData<(typeof dataBeneficiariesDownload)[number]>(
			dataBeneficiariesDownload,
			"beneficiary_types"
		);
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
				<Typography
					style={{
						fontSize: "1rem",
						fontWeight: 500,
						textTransform: "uppercase",
					}}
				>
					Total and CVA allocations by Fund
				</Typography>
				<Typography
					style={{
						fontSize: "0.8rem",
						display: "flex",
						alignItems: "center",
					}}
				>
					{"("}
					<AdsClickIcon
						style={{
							fontSize: 18,
							marginLeft: 3,
							marginRight: 3,
							color: "#777",
							opacity: 0.6,
						}}
					/>
					{
						<span style={{ color: colors.contrastColorDarker }}>
							{" "}
							targeted,{" "}
						</span>
					}
					<DoneIcon
						style={{
							fontSize: 18,
							marginLeft: 3,
							marginRight: 3,
							color: "#777",
							opacity: 0.6,
						}}
					/>
					{<span style={{ color: colors.unColor }}> reached)</span>}
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
					mb={-2}
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
						Reached as %<br />
						of targeted
					</Typography>
				</Box>
				{data.map(d => (
					<BarChartRow
						key={d.type}
						type={d.type}
						targeted={d.targeted}
						reached={d.reached}
						maxValue={maxValue}
						list={lists[listProperty]}
						chartType={chartType}
					/>
				))}
			</Box>
		</Container>
	);
}

const MemoisedFundsChart = React.memo(FundsChart);

export default MemoisedFundsChart;
