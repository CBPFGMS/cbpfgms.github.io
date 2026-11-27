import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import NumberAnimator from "./NumberAnimator";
import formatSIFloat from "../utils/formatsi";
import toLocaleFixed from "../utils/localefixed";
import { constants } from "../utils/constants";
import truncatePercentage from "../utils/truncatepercentage";
import LaunchIcon from "@mui/icons-material/Launch";

type AttributionCardsProps = {
	donorValue: number;
	totalValue: number;
	percentage: number;
	donor: number;
	fundName: string;
	donorName: string;
	donors: number[];
	handleClick: (thisFund: number) => void;
	handleClickKeepOnly: (thisFund: number) => void;
	isTheOnlyCard: boolean;
	flagSrc: string;
};

const { cardOpacity } = constants;

function AttributionCards({
	donorValue,
	totalValue,
	percentage,
	donor,
	fundName,
	donorName,
	donors,
	handleClick,
	handleClickKeepOnly,
	isTheOnlyCard,
	flagSrc,
}: AttributionCardsProps) {
	const donorSelected = donors.includes(donor);
	const isTheOnlySelectedDonor = donorSelected && donors.length === 1;
	const {
		truncatedPercentage,
		truncatedPercentageForDisplay,
		lessThanMinimum,
	} = truncatePercentage(percentage);

	return (
		<Box
			sx={{
				width: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100%",
				flexDirection: "column",
			}}
		>
			<Card
				variant="outlined"
				sx={{
					width: "100%",
					display: "flex",
					height: "100%",
					borderRadius: "8px",
					background: donorSelected ? "#f7fbff" : "#fcfcfc",
					border: donorSelected
						? "1px solid #b5d4f4"
						: "1px solid #e1e1e1",
					boxShadow: donorSelected
						? "0 0 6px rgba(0, 0, 0, 0.2)"
						: "none",
				}}
			>
				<CardContent
					sx={{
						display: "flex",
						flexGrow: 1,
						"&:last-child": {
							paddingBottom: "16px",
						},
					}}
				>
					<Box
						style={{
							width: "100%",
							height: "100%",
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
						}}
					>
						<Box
							style={{
								display: "flex",
								width: "100%",
								flexDirection: "row",
								alignItems: "center",
								marginBottom: "1.2em",
								gap: "0.5em",
							}}
						>
							<Box
								className={`attrib-remove-btn attrib-rb-blue`}
								onClick={() => handleClick(donor)}
								sx={{
									display: "flex",
									flex: 1,
									justifyContent: "center",
									opacity: isTheOnlySelectedDonor ? 0.5 : 1,
									filter: isTheOnlySelectedDonor
										? "grayscale(100%)"
										: "none",
									pointerEvents: isTheOnlySelectedDonor
										? "none"
										: "auto",
								}}
							>
								{donorSelected ? "Remove" : "Add"}
							</Box>
							<Box
								className={`attrib-remove-btn attrib-rb-blue`}
								onClick={() => handleClickKeepOnly(donor)}
								sx={{
									display: "flex",
									flex: 1,
									justifyContent: "center",
									opacity: isTheOnlyCard ? 0.5 : 1,
									filter: isTheOnlyCard
										? "grayscale(100%)"
										: "none",
									pointerEvents: isTheOnlyCard
										? "none"
										: "auto",
								}}
							>
								{isTheOnlySelectedDonor && !isTheOnlyCard
									? "Add all"
									: "Keep Only"}
							</Box>
							<Box
								component={"a"}
								href={`attribution.html?donor=${donor}`}
								data-tooltip-id="tooltip"
								data-tooltip-content={`Click to navigate to ${donorName} attribution page`}
								data-tooltip-place="bottom"
								className={`attrib-remove-btn attrib-rb-blue`}
								sx={{
									display: "flex",
									justifyContent: "center",
									opacity: isTheOnlyCard ? 0.5 : 1,
									filter: isTheOnlyCard
										? "grayscale(100%)"
										: "none",
									pointerEvents: isTheOnlyCard
										? "none"
										: "auto",
									padding: "3px",
								}}
							>
								<LaunchIcon fontSize="small" />
							</Box>
						</Box>
						<Box
							style={{
								marginBottom: "1em",
								opacity: donorSelected ? 1 : cardOpacity,
								filter: donorSelected
									? "none"
									: "grayscale(100%)",
							}}
						>
							<Box
								{...(donorName.length > 25 && {
									"data-tooltip-id": "tooltip",
									"data-tooltip-content": `${donorName}`,
									"data-tooltip-place": "bottom",
								})}
								sx={{
									height: "32px",
									display: "flex",
									alignItems: "center",
								}}
							>
								<img
									src={flagSrc}
									width="32px"
									style={{
										borderRadius: "3px",
										boxShadow:
											"0 0.5rem 0.5rem rgba(0, 0, 0, 0.1)",
									}}
									alt={`${donorName} flag`}
								/>
								<Typography
									variant="h6"
									sx={{
										fontSize: "18px",
										lineHeight: "1.1em",
										marginLeft: "0.4em",
										display: "-webkit-box",
										WebkitBoxOrient: "vertical",
										WebkitLineClamp: 2,
										overflow: "hidden",
									}}
									className="attrib-cl-blue"
								>
									{donorName}
								</Typography>
							</Box>
						</Box>
						<Box
							sx={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
								opacity: donorSelected ? 1 : cardOpacity,
								filter: donorSelected
									? "none"
									: "grayscale(100%)",
							}}
						>
							<Typography
								sx={{
									fontSize: "20px",
									fontWeight: 500,
								}}
								data-tooltip-id="tooltip"
								data-tooltip-content={`${fundName} attribution from ${donorName}: ${lessThanMinimum || truncatedPercentage}%`}
								data-tooltip-place="top"
								className={`attrib-cv-blue`}
							>
								<NumberAnimator
									number={truncatedPercentageForDisplay}
									type="decimal"
								/>
								{"%"}
							</Typography>
							<Typography
								sx={{
									fontSize: "18px",
									fontWeight: 400,
									paddingLeft: "0.5em",
								}}
								data-tooltip-id="tooltip"
								data-tooltip-content={`Total received from ${donorName}: $${toLocaleFixed(donorValue, 0, 2)}`}
								data-tooltip-place="top"
								className={`attrib-cv-blue`}
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
								opacity: donorSelected ? 1 : cardOpacity,
								filter: donorSelected
									? "none"
									: "grayscale(100%)",
							}}
							className="attrib-card-footer"
							data-tooltip-id="tooltip"
							data-tooltip-content={`Total donated by ${donorName} to all funds, including ${fundName}: $${toLocaleFixed(totalValue, 0, 2)}`}
							data-tooltip-place="top"
						>
							<Box className={`attrib-prog-track attrib-pt-blue`}>
								<Box
									className={`attrib-prog-fill attrib-pf-blue`}
									style={{
										width: percentage * 100 + "%",
										transitionProperty: "width",
										transitionDuration: "0.75s",
									}}
								></Box>
							</Box>
							<Box className={`attrib-pct attrib-pct-blue`}>
								<Typography
									sx={{ fontWeight: 500, fontSize: "14px" }}
								>
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
											{formatSIFloat(totalValue).slice(
												-1,
											)}
										</span>
									)}
								</Typography>
							</Box>
						</Box>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
}

export default AttributionCards;
