import Box from "@mui/material/Box";
import type { Attributions } from "../utils/calculateattributions";
import { useState } from "react";
import Snack from "./Snack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import NumberAnimator from "./NumberAnimator";
import formatSIFloat from "../utils/formatsi";

type TopAttributionCardProps = {
	donor: number;
	funds: number[];
	attributions: Attributions;
};

function TopAttributionCard({
	donor,
	funds,
	attributions,
}: TopAttributionCardProps) {
	const [openSnack, setOpenSnack] = useState<boolean>(false);

	const percentage = attributions.global.percentage;
	const totalValue = attributions.global.total;
	const donorValue = attributions.global.donor;

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
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one implementation status must be selected`}
			/>
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
							marginBottom: "1em",
						}}
					>
						<Grid size={9}>
							<Typography
								variant="h6"
								sx={{
									fontSize: "1.1em",
								}}
								className="attrib-cl-amber"
							>
								Global attribution
							</Typography>
						</Grid>
						<Grid
							size={3}
							sx={{
								justifyContent: "flex-end",
							}}
						>
							<Box
								className={`attrib-remove-btn attrib-rb-amber`}
								sx={{
									display: "flex",
									justifyContent: "center",
								}}
							>
								Info
							</Box>
						</Grid>
					</Box>
					<Typography
						sx={{
							fontSize: "43px",
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
					<Box
						sx={{
							marginTop: "1em",
						}}
						className="attrib-card-footer"
						data-tooltip-id="tooltip"
						// data-tooltip-content={`The total amount of allocations for ${title} projects is $${toLocaleFixed(
						// 	statusValue,
						// 	0,
						// 	2,
						// )}, which represents ${(
						// 	(statusValue / total) *
						// 	100
						// ).toFixed(
						// 	2,
						// )}% of the total allocations for all statuses (${toLocaleFixed(
						// 	total,
						// 	0,
						// 	2,
						// )}).`}
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
