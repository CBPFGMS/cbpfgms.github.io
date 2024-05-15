import { sum, format } from "d3";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import MoneyBag from "../assets/MoneyBag";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import DownloadIcon from "./DownloadIcon";
import colors from "../utils/colors";
//import downloadData from "../utils/downloaddata";
import SummaryRow from "./SummaryRow";
import { DatumSummary } from "../utils/processdatasummary";
import { DownloadStates } from "./MainContainer";
import { ListObj } from "../utils/makelists";
import Divider from "@mui/material/Divider";

type SummaryChartProps = {
	dataSummary: DatumSummary[];
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	//summaryDataDownload: ByDisabilityObj[];
	fundsList: ListObj;
};

function SummaryChart({
	dataSummary,
	clickedDownload,
	setClickedDownload,
}: //summaryDataDownload,
//fundsList,
SummaryChartProps) {
	// function handleDownloadClick() {
	// 	const data = summaryDataDownload.map(d => ({
	// 		"Report date": d.ReportApprovedDate,
	// 		Year: d.AllocationYear,
	// 		Allocation: d.Budget,
	// 		Fund: fundsList[d.PooledFundId],
	// 		"Number of Projects": d.NumbofProjects,
	// 		"Number of Partners": d.TotalNumbPartners,
	// 	}));
	// 	downloadData<(typeof data)[number]>(data, "summary");
	// }

	const total = sum(dataSummary, d => d.allocations),
		totalProjects = sum(dataSummary, d => d.projects.size),
		totalPartners = sum(dataSummary, d => d.partners.size);

	console.log(dataSummary);

	return (
		<Container
			disableGutters={true}
			style={{ position: "relative" }}
		>
			<DownloadIcon
				//handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type="summary"
			/>
			<Box
				display={"flex"}
				alignItems={"center"}
				justifyContent={"center"}
				gap={1}
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
								{thisValue < 1e3 ? (
									<NumberAnimator
										number={thisValue}
										type="integer"
									/>
								) : (
									<span>
										<NumberAnimator
											number={parseFloat(
												formatSIFloat(thisValue)
											)}
											type="integer"
										/>
										{formatSIFloat(thisValue).slice(-1)}
									</span>
								)}
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
						key={i}
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

export default SummaryChart;
