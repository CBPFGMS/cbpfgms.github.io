import { sum } from "d3-array";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import MoneyBag from "../assets/MoneyBag";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import { format } from "d3-format";
import DownloadIcon from "./DownloadIcon";
import colors from "../utils/colors";
import downloadData from "../utils/downloaddata";
import SummaryRow from "./SummaryRow";

function SummaryChart({
	dataSummary,
	year,
	clickedDownload,
	setClickedDownload,
}: SummaryChartProps) {
	const data = dataSummary.filter(d =>
		year !== null ? year.includes(d.year) : true
	);

	function handleDownloadClick() {
		downloadData<(typeof data)[number]>(data, "summary");
	}

	const total = sum(data, d => d.allocations);

	return (
		<Container
			disableGutters={true}
			style={{ position: "relative" }}
		>
			<DownloadIcon
				handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type="summary"
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

export default SummaryChart;
