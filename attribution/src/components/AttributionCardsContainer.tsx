import Box from "@mui/material/Box";
import type { Attributions } from "../utils/calculateattributions";
import { useState } from "react";
import Snack from "./Snack";
import Grid from "@mui/material/Grid";
import type { List } from "../utils/makelists";
import AttributionCard from "./AttributionCard";
import Typography from "@mui/material/Typography";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { constants } from "../utils/constants";
import NorthIcon from "@mui/icons-material/North";
import IconsLegend from "./IconsLegend";
import colors from "../utils/colors";
import AttributionCardExplanation from "./AttributionCardExplanation";

type AttributionCardsContainerProps = {
	attributions: Attributions;
	lists: List;
	donor: number;
	funds: number[];
	allFunds: number[];
	setFunds: React.Dispatch<React.SetStateAction<number[]>>;
};

type SortOrder = "asc" | "desc";

type SortBy = (typeof sortByOptions)[number];

const { sortByOptions } = constants;

function AttributionCardsContainer({
	attributions,
	lists,
	donor,
	funds,
	allFunds,
	setFunds,
}: AttributionCardsContainerProps) {
	const [openSnack, setOpenSnack] = useState<boolean>(false);
	const [openExplanation, setOpenExplanation] = useState<boolean>(false);
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
	const [sortBy, setSortBy] = useState<SortBy>("attribution");

	const keyGetters: Record<SortBy, (d: number) => number | string> = {
		attribution: d => attributions[d].percentage,
		total: d => attributions[d].total,
		donation: d => attributions[d].donor,
		alphabetical: d => lists.fundNames[d],
	};

	const getKey = keyGetters[sortBy] ?? ((d: number) => d.toString());
	const direction = sortOrder === "asc" ? 1 : -1;

	const sortedFunds = allFunds.toSorted((a, b) => {
		const keyA = getKey(a);
		const keyB = getKey(b);

		const comparison =
			typeof keyA === "string" && typeof keyB === "string"
				? keyA.localeCompare(keyB)
				: (keyA as number) - (keyB as number);

		return comparison * direction;
	});

	function handleClick(thisFund: number) {
		if (funds.length === 1 && funds.includes(thisFund)) {
			setOpenSnack(true);
			return;
		}
		setFunds(
			funds.includes(thisFund)
				? funds.filter(e => thisFund !== e)
				: [...funds, thisFund],
		);
	}

	function handleClickKeepOnly(thisFund: number) {
		if (funds.length === 1 && funds.includes(thisFund)) {
			setFunds(allFunds);
		} else {
			setFunds([thisFund]);
		}
	}

	function handleChangeSortBy(
		_event: React.MouseEvent<HTMLElement, MouseEvent>,
		value: typeof sortBy,
	) {
		if (value === null) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortOrder(value === "alphabetical" ? "asc" : "desc");
			setSortBy(value);
		}
	}

	return (
		<Box
			sx={{
				width: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				marginTop: "3em",
				flexDirection: "column",
			}}
		>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one fund must be selected`}
			/>
			<AttributionCardExplanation
				open={openExplanation}
				onClose={() => setOpenExplanation(false)}
			/>
			<Box
				sx={{
					width: "100%",
					display: "flex",
					justifyContent: "flex-start",
					flexDirection: "column",
				}}
			>
				<Box
					sx={{
						width: "100%",
						display: "flex",
						alignItems: "baseline",
						flexDirection: "row",
					}}
				>
					<Typography
						variant="h6"
						sx={{ fontWeight: 400, color: "#333" }}
					>
						Attribution per fund
					</Typography>
					<Typography
						component="button"
						type="button"
						aria-haspopup="dialog"
						aria-expanded={openExplanation}
						onClick={() => setOpenExplanation(true)}
						sx={{
							fontWeight: 400,
							fontSize: "0.85em",
							color: `color-mix(in srgb, ${colors.donorColor} 85%, black)`,
							marginLeft: "0.5em",
							padding: 0,
							border: 0,
							background: "none",
							cursor: "pointer",
							"&:hover": { textDecoration: "underline" },
							"&:focus-visible": {
								outline: "2px solid currentColor",
								outlineOffset: 3,
							},
						}}
					>
						(click here for explanation)
					</Typography>
				</Box>
				<Box
					sx={{
						width: "100%",
						display: "flex",
						justifyContent: "flex-start",
						alignItems: "center",
						flexDirection: "row",
						marginBottom: "2em",
						marginTop: "0.5em",
					}}
				>
					<Typography
						variant="body1"
						sx={{ fontWeight: 400, color: "#333" }}
					>
						Sort by:
					</Typography>
					<ToggleButtonGroup
						value={sortBy}
						exclusive
						sx={{ marginLeft: "1em" }}
						onChange={handleChangeSortBy}
					>
						{sortByOptions.map(option => (
							<ToggleButton
								value={option}
								key={option}
								sx={{
									padding: "6px 11px",
								}}
							>
								{
									<span
										style={{
											paddingLeft: "24px",
											paddingRight: "6px",
										}}
									>
										{option}
									</span>
								}
								{
									<NorthIcon
										sx={{
											fontSize: "16px",
											transform:
												sortOrder === "desc"
													? "rotate(180deg)"
													: "none",
											transition:
												"transform 0.2s ease-in-out",
											opacity: option === sortBy ? 1 : 0,
										}}
									/>
								}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
				</Box>
			</Box>
			<Grid
				container
				spacing={2}
				sx={{
					width: "100%",
				}}
			>
				{sortedFunds.map(fund => {
					return (
						<Grid
							size={2.4}
							key={fund}
						>
							<AttributionCard
								donorValue={attributions[fund].donor}
								totalValue={attributions[fund].total}
								percentage={attributions[fund].percentage}
								fund={fund}
								fundName={lists.fundNames[fund]}
								donorName={lists.donorGMSNames[donor]}
								funds={funds}
								handleClick={handleClick}
								handleClickKeepOnly={handleClickKeepOnly}
								isTheOnlyCard={allFunds.length === 1}
							/>
						</Grid>
					);
				})}
			</Grid>
			<IconsLegend donorName={lists.donorGMSNames[donor]} />
		</Box>
	);
}

export default AttributionCardsContainer;
