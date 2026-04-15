import React from "react";
import GradientPaper from "./GradientPaper";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import NumberAnimator, { type NumberAnimatorProps } from "./NumberAnimator";
import type { DataTopFigures } from "../utils/processdatatopfigures";
import Box from "@mui/material/Box";
import WarningIcon from "@mui/icons-material/Warning";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import { constants } from "../utils/constants";

const { disclaimerWarningColor, disclaimerText } = constants;

type TopFiguresProps = {
	data: DataTopFigures;
};

type CardsDatum = {
	label: string;
	value: number;
	type: NumberAnimatorProps["type"];
	format?: boolean;
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
			type: "integer",
			format: true,
		},
	];

	return (
		<Paper
			elevation={0}
			style={{
				padding: "1em",
				backgroundColor: "#f8f8f8",
				borderRadius: "8px",
				position: "relative",
			}}
		>
			<GradientPaper color={"#888888"} />
			<Grid
				container
				spacing={2}
				zIndex={10}
				position={"relative"}
			>
				{cardsData.map((card, index) => (
					<Grid
						key={index}
						size={3}
						className="topfigures-card"
					>
						<Box
							mb={2}
							style={{
								borderTop: "1px solid black",
								borderBottom: "1px solid black",
							}}
							{...(card.label === "Allocated / Launched" && {
								"data-tooltip-id": "tooltip",
								"data-tooltip-html":
									"$" + card.value.toLocaleString(),
								"data-tooltip-place": "top",
							})}
							{...(card.label === "Targeted People" && {
								"data-tooltip-id": "tooltip",
								"data-tooltip-html":
									card.value.toLocaleString() + " people",
								"data-tooltip-place": "top",
							})}
						>
							<Typography
								style={{
									fontSize: "2.5rem",
									color: "var(--ocha-blue)",
									fontWeight: 700,
									fontFamily: "Montserrat",
								}}
							>
								{card.label === "Allocated / Launched" && "$"}
								<NumberAnimator
									number={
										card.format
											? parseFloat(
													formatSIFloat(card.value),
												)
											: card.value
									}
									type={card.type}
								/>
								{card.format &&
								isNaN(+formatSIFloat(card.value).slice(-1))
									? formatSIFloat(card.value).slice(-1)
									: ""}
							</Typography>
						</Box>
						<Typography
							style={{
								fontSize: "1rem",
								color: "#666",
							}}
						>
							{card.label === "Targeted People" && (
								<WarningIcon
									style={{
										fontSize: "1.2rem",
										color: disclaimerWarningColor,
										verticalAlign: "text-bottom",
										marginRight: "6px",
									}}
									data-tooltip-id="tooltip"
									data-tooltip-content={disclaimerText}
									data-tooltip-place="top"
								/>
							)}
							{card.label}
						</Typography>
					</Grid>
				))}
			</Grid>
		</Paper>
	);
}

const MemoizedTopFigures = React.memo(TopFigures);

export default MemoizedTopFigures;
