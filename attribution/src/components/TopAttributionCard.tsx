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
import createFundsList from "../utils/createfundslist";

type TopAttributionCardProps = {
	donor: number;
	attributions: Attributions;
	lists: List;
	funds: number[];
	allFunds: number[];
};

function TopAttributionCard({
	donor,
	attributions,
	lists,
	funds,
	allFunds,
}: TopAttributionCardProps) {
	const percentage = attributions.global.percentage;
	const totalValue = attributions.global.total;
	const donorValue = attributions.global.donor;

	const allFundsSelected = allFunds.length === funds.length;

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
					background: "#fffdf8",
					border: "1px solid #fac775",
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
									className="attrib-cl-amber"
								>
									Global attribution
								</Typography>
								{!allFundsSelected && (
									<InfoIcon
										data-tooltip-id="tooltip"
										data-tooltip-content={`Global attribution refers only to the selected fund${funds.length > 1 ? "s" : ""}: ${createFundsList({ funds, lists })}`}
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
								data-tooltip-content={`${lists.donorGMSNames[donor]} combined attributed allocation for the selected funds is $${toLocaleFixed(donorValue, 0, 2)}, which corresponds to ${(percentage * 100).toFixed(1)}% of the total $${toLocaleFixed(totalValue, 0, 2)} allocated for those funds.`}
								data-tooltip-place="top"
								className={`attrib-info-btn attrib-rb-amber`}
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
							data-tooltip-content={`Global attribution: ${(percentage * 100).toFixed(1)}%`}
							data-tooltip-place="top"
							className={`attrib-cv-amber`}
						>
							<NumberAnimator
								number={Math.round(percentage * 1000) / 10}
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
							data-tooltip-content={`Donated: $${toLocaleFixed(donorValue, 0, 2)}`}
							data-tooltip-place="top"
							className={`attrib-cv-amber`}
						>
							{"($"}
							{donorValue < 1e3 ? (
								<NumberAnimator
									number={Math.floor(donorValue)}
									type="integer"
								/>
							) : (
								<span>
									<NumberAnimator
										number={parseFloat(
											formatSIFloat(donorValue),
										)}
										type="decimal"
									/>
									{formatSIFloat(donorValue).slice(-1)}
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
						data-tooltip-content={`Total donated: $${toLocaleFixed(totalValue, 0, 2)}`}
						data-tooltip-place="top"
					>
						<Box className={`attrib-prog-track attrib-pt-amber`}>
							<Box
								className={`attrib-prog-fill attrib-pf-amber`}
								style={{
									width: percentage * 100 + "%",
									transitionProperty: "width",
									transitionDuration: "0.75s",
								}}
							></Box>
						</Box>
						<Box className={`attrib-pct attrib-pct-amber`}>
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
