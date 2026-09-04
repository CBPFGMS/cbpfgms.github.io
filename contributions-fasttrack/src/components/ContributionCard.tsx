import { useState } from "react";
import Card from "@mui/material/Card";
import type { TopValuesDatum } from "../utils/processtopvalues";
import type { ContributionType } from "./MainContainer";
import type { List } from "../utils/makelists";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import NumberAnimator from "./NumberAnimator";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import capitalizeString from "../utils/capitalizestring";
import formatSIFloat from "../utils/formatsi";
import colors from "../utils/colors";
import InfoIcon from "@mui/icons-material/Info";
import RegionalFundsTooltip from "./RegionalFundsTooltip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

type ContributionCardProps = {
	topValuesDatum: TopValuesDatum;
	contributionType: ContributionType;
	type: ContributionType;
	setContributionType: React.Dispatch<React.SetStateAction<ContributionType>>;
	lists: List;
	isStacked: boolean;
	setIsStacked: React.Dispatch<React.SetStateAction<boolean>>;
};

const infoIconStyle = {
	color: "#777",
	fontSize: "16px",
	marginLeft: "0.2em",
	alignSelf: "center",
	marginTop: "-0.4em",
};

const smallTextStyle = {
	fontSize: "16px",
	fontWeight: 400,
	paddingLeft: "0.5em",
	color: "#333",
};

function ContributionCard({
	topValuesDatum,
	contributionType,
	type,
	setContributionType,
	lists,
	isStacked,
	setIsStacked,
}: ContributionCardProps) {
	const typeSelected = contributionType === type;

	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	const smallValueStyle = {
		fontSize: "22px",
		lineHeight: "1.3",
		fontWeight: 600,
		color: typeSelected ? colors.unColorDarker : "#555",
	};

	function handleClickSelect() {
		setContributionType(type);
	}

	function handlePopperTriggerMouseEnter(
		event: React.MouseEvent<HTMLElement>,
	) {
		setAnchorEl(event.currentTarget);
	}

	function handlePopperTriggerMouseLeave() {
		setAnchorEl(null);
	}

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
					background: typeSelected ? "#f7fbff" : "#fafafa",
					border: typeSelected
						? "1px solid #b5d4f4"
						: "1px solid #ccc",
					boxShadow: typeSelected
						? "0 0 10px rgba(0, 0, 0, 0.2)"
						: "none",
				}}
			>
				<CardContent
					sx={{
						display: "flex",
						width: "100%",
						"&:last-child": {
							pb: 2,
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
								marginBottom: "0.6em",
								gap: "0.5em",
								justifyContent: "space-between",
							}}
						>
							<Typography
								variant="h5"
								sx={{ fontSize: "22px" }}
							>
								{capitalizeString(type)}
							</Typography>
							{typeSelected ? (
								<CheckCircleIcon color="success" />
							) : (
								<Box
									onClick={handleClickSelect}
									sx={{
										display: "flex",
										justifyContent: "center",
										fontSize: "14px",
										fontWeight: "normal",
										padding: "2px 16px",
										borderRadius: "20px",
										border: "1px solid",
										cursor: "pointer",
										color: "#185fa5",
										borderColor: "#b5d4f4",
										background: "#edf5fd",
									}}
								>
									Select
								</Box>
							)}
						</Box>
						<Box
							style={{
								marginBottom: "0.4em",
							}}
						>
							<Typography
								sx={{
									fontSize: "46px",
									fontWeight: 500,
									color: typeSelected
										? colors.unColorDarker
										: "#555",
									width: "fit-content",
								}}
								data-tooltip-id="tooltip"
								data-tooltip-content={`$${topValuesDatum.value.toLocaleString()}`}
								data-tooltip-place="top"
							>
								{"$"}
								{topValuesDatum.value < 1e3 ? (
									<NumberAnimator
										number={Math.floor(
											topValuesDatum.value,
										)}
										type="integer"
									/>
								) : (
									<span>
										<NumberAnimator
											number={parseFloat(
												formatSIFloat(
													topValuesDatum.value,
												),
											)}
											type="decimal"
										/>
										{formatSIFloat(
											topValuesDatum.value,
										).slice(-1)}
									</span>
								)}
							</Typography>
						</Box>
						<Box
							sx={{
								display: "flex",
								flexDirection: "row",
								gap: "0.5em",
								justifyContent: "space-between",
							}}
						>
							<Box>
								<Box
									sx={{
										display: "flex",
										flexDirection: "row",
										alignItems: "baseline",
									}}
								>
									<Typography
										sx={smallValueStyle}
										data-tooltip-id="tooltip"
										//data-tooltip-content={`${donorName} attribution for ${fundName}: ${(percentage * 100).toFixed(1)}%`}
										data-tooltip-place="top"
									>
										<NumberAnimator
											number={topValuesDatum.cbpfs.size}
											type="decimal"
										/>
									</Typography>
									<Typography sx={smallTextStyle}>
										CBPFs
									</Typography>
								</Box>
								<Box
									sx={{
										display: "flex",
										flexDirection: "row",
										alignItems: "baseline",
									}}
									className="Popper-trigger"
									onMouseEnter={handlePopperTriggerMouseEnter}
									onMouseLeave={handlePopperTriggerMouseLeave}
								>
									<Typography
										sx={smallValueStyle}
										data-tooltip-id="tooltip"
										//data-tooltip-content={`${donorName} attribution for ${fundName}: ${(percentage * 100).toFixed(1)}%`}
										data-tooltip-place="top"
									>
										{topValuesDatum.cbpfs.size > 9 && (
											<span style={{ opacity: 0 }}>
												0
											</span>
										)}
										<NumberAnimator
											number={
												topValuesDatum
													.fundsPerRegionalFund.size
											}
											type="decimal"
										/>
									</Typography>
									<Typography sx={smallTextStyle}>
										Regional Funds
									</Typography>
									<InfoIcon style={infoIconStyle} />
									<RegionalFundsTooltip
										anchorEl={anchorEl}
										topValuesDatum={topValuesDatum}
										lists={lists}
									/>
								</Box>
							</Box>
							<Box
								sx={{
									maxWidth: "32%",
									alignSelf: "flex-end",
								}}
							>
								{typeSelected && type === "total" && (
									<FormControlLabel
										control={
											<Checkbox
												checked={isStacked}
												onChange={e =>
													setIsStacked(
														e.target.checked,
													)
												}
											/>
										}
										label="Show breakdown"
										sx={{
											"& .MuiFormControlLabel-label": {
												fontSize: "0.8rem",
											},
											marginRight: "0px",
										}}
									/>
								)}
							</Box>
						</Box>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
}

export default ContributionCard;
