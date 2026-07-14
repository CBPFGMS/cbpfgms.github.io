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
		setFunds([thisFund]);
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
				marginBottom: "2.5em",
				flexDirection: "column",
			}}
		>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one fund must be selected`}
			/>
			<Box
				sx={{
					width: "100%",
					display: "flex",
					justifyContent: "flex-start",
					flexDirection: "column",
				}}
			>
				<Typography
					variant="h6"
					sx={{ fontWeight: 400, color: "#333" }}
				>
					Attribution per fund
				</Typography>
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
