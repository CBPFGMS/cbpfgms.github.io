import React, { useRef } from "react";
import { sum } from "d3-array";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import MoneyBag from "../assets/MoneyBag";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import { format } from "d3-format";
import DownloadAndImageContainer from "./DownloadAndImageContainer";
import colors from "../utils/colors";
import downloadData from "../utils/downloaddata";
import SummaryRow from "./SummaryRow";
import { SummaryChartProps } from "../types";

function SummaryChart({
	dataSummary,
	year,
	clickedDownload,
	setClickedDownload,
	summaryDataDownload,
	fundsList,
}: SummaryChartProps) {
	const data = dataSummary.filter(d =>
		year !== null ? year.includes(d.year) : true
	);

	const ref = useRef<HTMLDivElement>(null);

	function handleDownloadClick() {
		const data = summaryDataDownload.map(d => ({
			"Report date": d.ReportApprovedDate,
			Year: d.AllocationYear,
			Allocation: d.Budget,
			Fund: fundsList[d.PooledFundId],
			"Number of Projects": d.NumbofProjects,
			"Number of Partners": d.TotalNumbPartners,
		}));
		downloadData<(typeof data)[number]>(data, "summary");
	}

	const total = sum(data, d => d.allocations);

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
				gap={1}
				marginBottom={2}
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
							<NumberAnimator number={total} />
						) : (
							<span>
								<NumberAnimator
									number={parseFloat(formatSIFloat(total))}
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
			</Box>
			<Box
				display={"flex"}
				flexDirection={"column"}
				alignItems={"center"}
				justifyContent={"center"}
				gap={1}
				marginLeft={4}
			>
				{data.map((d, i) => (
					<SummaryRow
						key={i}
						year={d.year}
						allocations={d.allocations}
						projects={d.projects}
						partners={d.partners}
						last={i === data.length - 1}
					/>
				))}
			</Box>
		</Container>
	);
}

const MemoizedSummaryChart = React.memo(SummaryChart);

export default MemoizedSummaryChart;
