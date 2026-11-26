import Box from "@mui/material/Box";
import type { Attributions } from "../utils/calculateattributions";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import NumberAnimator from "./NumberAnimator";
import formatSIFloat from "../utils/formatsi";
import type { List } from "../utils/makelists";
import toLocaleFixed from "../utils/localefixed";
import InfoIcon from "@mui/icons-material/Info";
import createDonorsList from "../utils/createdonorslist";
import truncatePercentage from "../utils/truncatepercentage";
import colors from "../utils/colors";

type TopAttributionCardProps = {
	fund: number;
	attributions: Attributions;
	lists: List;
	donors: number[];
	allDonors: number[];
};

function TopAttributionCard({
	fund,
	attributions,
	lists,
	donors,
	allDonors,
}: TopAttributionCardProps) {
	const percentage = attributions.global.percentage;
	const totalValue = attributions.global.total;
	const fundValue = attributions.global.fund;
	const {
		truncatedPercentage,
		truncatedPercentageForDisplay,
		lessThanMinimum,
	} = truncatePercentage(percentage);

	const allDonorsSelected = allDonors.length === donors.length;

	return (
		<Box
			sx={{
				width: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				marginTop: "3em",
				marginBottom: "3em",
			}}
		>
			<Card
				variant="outlined"
				sx={{
					width: "50%",
					borderRadius: "8px",
					background: `color-mix(in srgb, ${colors.fundColor} 3.5%, white)`,
					border: `1px solid color-mix(in srgb, ${colors.fundColor} 50%, white)`,
					boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
				}}
			>
				<CardContent>
					<Box
						style={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "1.5em",
						}}
					>
						<Grid size={9}>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									flexDirection: "row",
								}}
							>
								<Typography
									variant="h6"
									sx={{
										fontSize: "1.1em",
									}}
									className="attrib-cl-fund"
								>
									Global attribution
								</Typography>
								{!allDonorsSelected && (
									<InfoIcon
										data-tooltip-id="tooltip"
										data-tooltip-content={`Global attribution refers only to the selected donor${donors.length > 1 ? "s" : ""}: ${createDonorsList({ donors, lists })}`}
										data-tooltip-place="top"
										style={{
											color: "#666",
											fontSize: "20px",
											marginLeft: "0.1em",
											alignSelf: "flex-start",
											marginTop: "-0.1em",
										}}
									/>
								)}
							</Box>
						</Grid>
						<Grid
							size={3}
							sx={{
								justifyContent: "flex-end",
							}}
						>
							<Box
								data-tooltip-id="tooltip"
								data-tooltip-content={`${lists.fundNames[fund]} combined attribution for the selected donors is $${toLocaleFixed(fundValue, 0, 2)}, which corresponds to ${lessThanMinimum || truncatedPercentage}% of the total $${toLocaleFixed(totalValue, 0, 2)} donated from those donors.`}
								data-tooltip-place="top"
								className={`attrib-info-btn attrib-rb-fund`}
								sx={{
									display: "flex",
									justifyContent: "center",
									cursor: "unset",
								}}
							>
								Info
							</Box>
						</Grid>
					</Box>
					<Box
						sx={{
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
						}}
					>
						<Typography
							sx={{
								fontSize: "42px",
								fontWeight: 500,
							}}
							data-tooltip-id="tooltip"
							data-tooltip-content={`Global attribution: ${lessThanMinimum || truncatedPercentage}%`}
							data-tooltip-place="top"
							className={`attrib-cv-fund`}
						>
							<NumberAnimator
								number={truncatedPercentageForDisplay}
								type="decimal"
							/>
							{"%"}
						</Typography>
						<Typography
							sx={{
								fontSize: "36px",
								fontWeight: 400,
								paddingLeft: "0.5em",
							}}
							data-tooltip-id="tooltip"
							data-tooltip-content={`Received: $${toLocaleFixed(fundValue, 0, 2)}`}
							data-tooltip-place="top"
							className={`attrib-cv-fund`}
						>
							{"($"}
							{fundValue < 1e3 ? (
								<NumberAnimator
									number={Math.floor(fundValue)}
									type="integer"
								/>
							) : (
								<span>
									<NumberAnimator
										number={parseFloat(
											formatSIFloat(fundValue),
										)}
										type="decimal"
									/>
									{formatSIFloat(fundValue).slice(-1)}
								</span>
							)}
							{")"}
						</Typography>
					</Box>
					<Box
						sx={{
							marginTop: "0.25em",
						}}
						className="attrib-card-footer"
						data-tooltip-id="tooltip"
						data-tooltip-content={`Total received: $${toLocaleFixed(totalValue, 0, 2)}`}
						data-tooltip-place="top"
					>
						<Box className={`attrib-prog-track attrib-pt-fund`}>
							<Box
								className={`attrib-prog-fill attrib-pf-fund`}
								style={{
									width: percentage * 100 + "%",
									transitionProperty: "width",
									transitionDuration: "0.75s",
								}}
							></Box>
						</Box>
						<Box className={`attrib-pct attrib-pct-fund`}>
							<Typography sx={{ fontWeight: 500 }}>
								{"$"}
								{totalValue < 1e3 ? (
									<NumberAnimator
										number={Math.floor(totalValue)}
										type="integer"
									/>
								) : (
									<span>
										<NumberAnimator
											number={parseFloat(
												formatSIFloat(totalValue),
											)}
											type="decimal"
										/>
										{formatSIFloat(totalValue).slice(-1)}
									</span>
								)}
							</Typography>
						</Box>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
}

export default TopAttributionCard;
