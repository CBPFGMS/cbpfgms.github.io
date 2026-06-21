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
import { getCustomProjectsDate } from "../utils/customprojectsdate";
import GradientPaper from "./GradientPaper";

const { disclaimerWarningColor, disclaimerText } = constants;

type TopFiguresProps = {
	data: DataTopFigures;
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

function TopFigures({ data }: TopFiguresProps) {
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
			subLabel: `from ${data.reachedProjects} project${data.reachedProjects > 1 ? "s" : ""} (as of ${getCustomProjectsDate(new Date())})`,
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
				spacing={1.5}
				alignItems="stretch"
			>
				{cardsData.map((card, index) => {
					const isReached = card.label === "Reached People";
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

					const tooltipProps: Record<string, string> = isAllocated
						? {
								"data-tooltip-id": "tooltip",
								"data-tooltip-html":
									"$" + card.value.toLocaleString(),
								"data-tooltip-place": "top",
							}
						: needsWarning
							? {
									"data-tooltip-id": "tooltip",
									"data-tooltip-html":
										card.value.toLocaleString() +
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
							size={isReached ? 2.8 : 2.3}
							className="topfigures-card"
							zIndex={10}
						>
							<Box
								style={cardStyle}
								{...tooltipProps}
								border={"0.5px solid rgba(0,0,0,0.1)"}
								borderLeft={
									isReached
										? "3px solid var(--ocha-amber)"
										: "3px solid var(--ocha-blue)"
								}
							>
								{/* Value row — always at the top */}
								<Box
									display="flex"
									alignItems="baseline"
									justifyContent="center"
									gap="6px"
									style={{ height: "3rem" }}
								>
									<Typography
										style={{
											fontSize: "2rem",
											fontWeight: 700,
											color: isReached
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
									display="flex"
									alignItems="center"
									justifyContent="flex-start"
									flexDirection="column"
									gap="3px"
									pt={1}
									style={{
										borderTop:
											"0.5px solid rgba(0,0,0,0.1)",
									}}
								>
									<Box
										display="flex"
										flexDirection="row"
										gap="6px"
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
											{/* {card.subLabel && (
											<span
												style={{
													display: "block",
													fontSize: "0.72rem",
													color: "#999",
													marginTop: "2px",
												}}
											>
												{card.subLabel}
											</span>
										)} */}
										</Typography>
									</Box>
									{card.subLabel && (
										<Typography
											style={{
												fontSize: "0.8rem",
												color: "#666",
											}}
										>
											{card.subLabel}
										</Typography>
									)}
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
