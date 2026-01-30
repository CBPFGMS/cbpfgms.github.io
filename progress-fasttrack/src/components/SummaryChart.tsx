import React, { useContext, useRef } from "react";
import DataContext, { DataContextType } from "../context/DataContext";
import { sum, format } from "d3";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import MoneyBag from "../assets/MoneyBag";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import colors from "../utils/colors";
import downloadData from "../utils/downloaddata";
import SummaryRow from "./SummaryRow";
import { DatumSummary } from "../utils/processdatasummary";
import { DownloadStates } from "./MainContainer";
import Divider from "@mui/material/Divider";
import { processSummaryDownload } from "../utils/processdownload";
import { ImplementationStatuses } from "./MainContainer";
import DownloadAndImageContainer from "./DownloadAndImageContainer";

type SummaryChartProps = {
	dataSummary: DatumSummary[];
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationStatus: ImplementationStatuses[];
	showFinanciallyClosed: boolean;
};

function SummaryChart({
	dataSummary,
	clickedDownload,
	setClickedDownload,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	showFinanciallyClosed,
}: SummaryChartProps) {
	const { data, lists } = useContext(DataContext) as DataContextType;

	const ref = useRef<HTMLDivElement>(null);

	function handleDownloadClick() {
		const dataSummaryDownload = processSummaryDownload({
			data,
			lists,
			year,
			fund,
			allocationSource,
			allocationType,
			implementationStatus,
			showFinanciallyClosed,
		});
		downloadData<(typeof dataSummaryDownload)[number]>(
			dataSummaryDownload,
			"summary"
		);
	}

	const total = sum(dataSummary, d => d.allocations),
		totalProjects = sum(dataSummary, d => d.projects.size),
		totalPartners = sum(dataSummary, d => d.partners.size);

	return (
		<Container
			disableGutters={true}
			style={{ position: "relative" }}
			ref={ref}
		>
			<DownloadAndImageContainer
				handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type="summary"
				refElement={ref}
				fileName="summary"
			/>
			<Box
				display={"flex"}
				alignItems={"center"}
				justifyContent={"center"}
				gap={2}
				marginBottom={4}
				data-tooltip-id="tooltip"
				data-tooltip-content={`Total allocations: $${format(",.2f")(
					total
				)}`}
				data-tooltip-place="top"
			>
				<MoneyBag style={{ fontSize: 60, fill: colors.unColor }} />
				<Box
					display={"flex"}
					flexDirection={"column"}
					alignItems={"center"}
					justifyContent={"center"}
					gap={0}
				>
					<Typography
						variant="h3"
						fontWeight={500}
						style={{ color: colors.unColor, border: "none" }}
					>
						{total < 1e3 ? (
							<NumberAnimator
								number={total}
								type="decimal"
							/>
						) : (
							<span>
								<NumberAnimator
									number={parseFloat(formatSIFloat(total))}
									type="decimal"
								/>
								{formatSIFloat(total).slice(-1)}
							</span>
						)}
					</Typography>
					<Typography
						style={{
							marginTop: "-0.6em",
							fontSize: 18,
							color: "#444",
						}}
					>
						Allocations
					</Typography>
				</Box>
				<Divider
					orientation="vertical"
					flexItem
				/>
				<Box
					display={"flex"}
					flexDirection={"column"}
					alignItems={"center"}
					justifyContent={"center"}
					gap={0}
				>
					{[totalProjects, totalPartners].map((thisValue, index) => (
						<Box
							display={"flex"}
							flexDirection={"row"}
							alignItems={"baseline"}
							justifyContent={"center"}
							gap={1}
							key={index}
						>
							<Typography
								fontWeight={500}
								fontSize={22}
								style={{
									color: colors.unColor,
									border: "none",
								}}
							>
								<NumberAnimator
									number={thisValue}
									type="integer"
								/>
							</Typography>
							<Typography
								style={{
									fontSize: 16,
									color: "#444",
								}}
							>
								{index ? "Partners" : "Projects"}
							</Typography>
						</Box>
					))}
				</Box>
			</Box>
			<Box
				display={"flex"}
				flexDirection={"column"}
				alignItems={"center"}
				justifyContent={"center"}
				gap={1}
				marginLeft={4}
			>
				{dataSummary.map((d, i) => (
					<SummaryRow
						key={d.year}
						year={d.year}
						allocations={d.allocations}
						projects={d.projects}
						partners={d.partners}
						underImplementation={d.underImplementation}
						last={i === dataSummary.length - 1}
					/>
				))}
			</Box>
		</Container>
	);
}

const MemoizedSummaryChart = React.memo(SummaryChart);

export default MemoizedSummaryChart;
