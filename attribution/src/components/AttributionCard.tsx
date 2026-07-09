import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import NumberAnimator from "./NumberAnimator";
import formatSIFloat from "../utils/formatsi";
import toLocaleFixed from "../utils/localefixed";

type AttributionCardsProps = {
	donorValue: number;
	totalValue: number;
	percentage: number;
	fund: number;
	fundName: string;
	donorName: string;
	funds: number[];
	handleClick: (thisFund: number) => void;
	handleClickKeepOnly: (thisFund: number) => void;
};

function AttributionCards({
	donorValue,
	totalValue,
	percentage,
	fund,
	fundName,
	donorName,
	funds,
	handleClick,
	handleClickKeepOnly,
}: AttributionCardsProps) {
	const fundSelected = funds.includes(fund);
	const isTheOnlySelectedFund = fundSelected && funds.length === 1;

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
					background: fundSelected ? "#f7fbff" : "#fafafa",
					border: fundSelected
						? "1px solid #b5d4f4"
						: "1px solid #ccc",
				}}
			>
				<CardContent
					sx={{
						display: "flex",
						flexGrow: 1,
						"&:last-child": {
							paddingBottom: "16px", // or whatever value you want, theme spacing units
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
								marginBottom: "1em",
								pointerEvents: isTheOnlySelectedFund
									? "none"
									: "unset",
								gap: "0.5em",
							}}
						>
							<Box
								className={`attrib-remove-btn attrib-rb-blue`}
								onClick={() => handleClick(fund)}
								sx={{
									display: "flex",
									flex: 1,
									justifyContent: "center",
									opacity: isTheOnlySelectedFund ? 0.5 : 1,
									filter: isTheOnlySelectedFund
										? "grayscale(100%)"
										: "none",
								}}
							>
								{fundSelected ? "Remove" : "Add"}
							</Box>
							<Box
								className={`attrib-remove-btn attrib-rb-blue`}
								onClick={() => handleClickKeepOnly(fund)}
								sx={{
									display: "flex",
									flex: 1,
									justifyContent: "center",
								}}
							>
								Keep Only
							</Box>
						</Box>
						<Box
							style={{
								marginBottom: "1.3em",
								opacity: fundSelected ? 1 : 0.5,
								filter: fundSelected
									? "none"
									: "grayscale(100%)",
							}}
						>
							<Typography
								variant="h6"
								sx={{
									fontSize: "18px",
									lineHeight: "1.2em",
								}}
								className="attrib-cl-blue"
							>
								{fundName}
							</Typography>
						</Box>
						<Box
							sx={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
								opacity: fundSelected ? 1 : 0.5,
								filter: fundSelected
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
								data-tooltip-content={`${donorName} attribution for ${fundName}: ${(percentage * 100).toFixed(1)}%`}
								data-tooltip-place="top"
								className={`attrib-cv-blue`}
							>
								<NumberAnimator
									number={Math.round(percentage * 1000) / 10}
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
								data-tooltip-content={`Donated: $${toLocaleFixed(donorValue, 0, 2)}`}
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
								marginTop: "0.4em",
								opacity: fundSelected ? 1 : 0.5,
								filter: fundSelected
									? "none"
									: "grayscale(100%)",
							}}
							className="attrib-card-footer"
							data-tooltip-id="tooltip"
							data-tooltip-content={`Total donated: $${toLocaleFixed(totalValue, 0, 2)}`}
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
