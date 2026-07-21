import React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import NumberAnimator, { type NumberAnimatorProps } from "./NumberAnimator";
import type { DataTopFigures } from "../utils/processdatatopfigures";
import Box from "@mui/material/Box";
import { WarningIcon } from "../assets/warningicon";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import { constants } from "../utils/constants";
import GradientPaper from "./GradientPaper";
import AbsoluteIcon from "./AbsoluteIcon";
import PercentageIcon from "./PercentageIcon";

const { disclaimerWarningColor, disclaimerText } = constants;

type TopFiguresProps = {
	data: DataTopFigures;
	attribution: number;
	donorName: string;
};

type CardsDatum = {
	label:
		| "# of Projects"
		| "# of Partners"
		| "Allocated / Launched"
		| "Targeted People"
		| "Reached People";
	value: number;
	type: NumberAnimatorProps["type"];
	format?: boolean;
	subLabel?: string;
};

function TopFigures({ data, attribution, donorName }: TopFiguresProps) {
	const cardsData: CardsDatum[] = [
		{
			label: "# of Projects",
			value: data.numberOfProjects,
			type: "integer",
		},
		{
			label: "# of Partners",
			value: data.numberOfPartners,
			type: "integer",
		},
		{
			label: "Allocated / Launched",
			value: data.allocations,
			type: "decimal",
			format: true,
		},
		{
			label: "Targeted People",
			value: data.targeted,
			type: "decimal",
			format: true,
		},
		{
			label: "Reached People",
			value: data.reached,
			type: "decimal",
			format: true,
		},
	];

	const reachedPct =
		data.targeted > 0
			? ((data.reached / data.targeted) * 100).toFixed(1) + "%"
			: null;

	const cardStyle: React.CSSProperties = {
		background: "#ffffff",
		borderRadius: "12px",
		padding: "1rem 1rem 0.85rem",
		display: "flex",
		flexDirection: "column",
		height: "100%",
		boxSizing: "border-box",
	};

	return (
		<Paper
			elevation={0}
			style={{
				padding: "1.25em",
				backgroundColor: "#f8f8f8",
				borderRadius: "12px",
				position: "relative",
				overflow: "hidden",
			}}
		>
			<GradientPaper color={"#999999"} />
			<Grid
				container
				sx={{
					alignItems: "stretch",
				}}
				spacing={1.5}
			>
				{cardsData.map((card, index) => {
					const isReached = card.label === "Reached People";
					const isTargeted = card.label === "Targeted People";
					const needsWarning =
						card.label === "Targeted People" ||
						card.label === "Reached People";
					const isAllocated = card.label === "Allocated / Launched";
					const formattedValue = card.format
						? parseFloat(formatSIFloat(card.value))
						: card.value;
					const suffix =
						card.format &&
						isNaN(+formatSIFloat(card.value).slice(-1))
							? formatSIFloat(card.value).slice(-1)
							: "";
					const Icon =
						card.label === "# of Partners" ||
						card.label === "# of Projects" ? (
							<AbsoluteIcon
								size={28}
								showTooltip={true}
								donorName={donorName}
							/>
						) : (
							<PercentageIcon
								size={28}
								showTooltip={true}
								donorName={donorName}
								attribution={
									Math.round(attribution * 1000) / 10
								}
							/>
						);

					const tooltipProps: Record<string, string> = isAllocated
						? {
								"data-tooltip-id": "tooltip",
								"data-tooltip-content":
									"$" +
									Math.floor(card.value).toLocaleString(),
								"data-tooltip-place": "top",
							}
						: needsWarning
							? {
									"data-tooltip-id": "tooltip",
									"data-tooltip-content":
										Math.floor(
											card.value,
										).toLocaleString() +
										" people" +
										(isReached
											? " (" +
												reachedPct +
												" of targeted)"
											: ""),
									"data-tooltip-place": "top",
								}
							: {};

					return (
						<Grid
							key={index}
							size={2.4}
							className="topfigures-card"
							sx={{
								zIndex: 10,
							}}
						>
							<Box
								sx={{
									...cardStyle,
									border: "0.5px solid rgba(0,0,0,0.1)",
									borderLeft: isTargeted
										? "3px solid var(--ocha-amber)"
										: "3px solid var(--ocha-blue)",
								}}
								{...tooltipProps}
							>
								{/* Value row — always at the top */}
								<Box
									sx={{
										height: "3rem",
										display: "flex",
										alignItems: "baseline",
										justifyContent: "center",
										gap: "6px",
									}}
								>
									<Typography
										style={{
											fontSize: "2rem",
											fontWeight: 700,
											color: isTargeted
												? "var(--ocha-amber)"
												: "var(--ocha-blue)",
											fontFamily: "Montserrat",
											lineHeight: 1.1,
										}}
									>
										{isAllocated && "$"}
										<NumberAnimator
											number={formattedValue}
											type={card.type}
										/>
										{suffix}
									</Typography>
									{isReached && reachedPct && (
										<Typography
											style={{
												fontSize: "0.9rem",
												fontWeight: 600,
												color: "var(--ocha-blue)",
												opacity: 0.9,
											}}
										>
											{"(" + reachedPct + ")"}
										</Typography>
									)}
								</Box>

								{/* Label row — anchored to the bottom */}
								<Box
									sx={{
										borderTop:
											"0.5px solid rgba(0,0,0,0.1)",
										display: "flex",
										alignItems: "center",
										justifyContent: "flex-start",
										flexDirection: "column",
										gap: "3px",
										pt: 1,
									}}
								>
									<Box
										sx={{
											display: "flex",
											flexDirection: "row",
											gap: "6px",
										}}
									>
										{needsWarning && (
											<WarningIcon
												size={18}
												color={disclaimerWarningColor}
												data-tooltip-id="tooltip"
												data-tooltip-content={
													disclaimerText
												}
												data-tooltip-place="top"
											/>
										)}
										<Typography
											style={{
												fontSize: "0.9rem",
												color: "#666",
												lineHeight: 1.35,
											}}
										>
											{card.label}
										</Typography>
									</Box>
									<Box sx={{ marginTop: "0.25em" }}>
										{Icon}
									</Box>
								</Box>
							</Box>
						</Grid>
					);
				})}
			</Grid>
		</Paper>
	);
}

const MemoizedTopFigures = React.memo(TopFigures);
export default MemoizedTopFigures;
