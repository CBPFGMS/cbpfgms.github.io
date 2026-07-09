import Box from "@mui/material/Box";
import type { Attributions } from "../utils/calculateattributions";
import { useState } from "react";
import Snack from "./Snack";
import Grid from "@mui/material/Grid";
// import Typography from "@mui/material/Typography";
import type { List } from "../utils/makelists";
import AttributionCard from "./AttributionCard";

type AttributionCardsContainerProps = {
	attributions: Attributions;
	lists: List;
	donor: number;
	funds: number[];
	allFunds: number[];
	setFunds: React.Dispatch<React.SetStateAction<number[]>>;
};

function AttributionCardsContainer({
	attributions,
	lists,
	donor,
	funds,
	allFunds,
	setFunds,
}: AttributionCardsContainerProps) {
	const [openSnack, setOpenSnack] = useState<boolean>(false);

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

	return (
		<Box
			sx={{
				width: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				marginTop: "3em",
				marginBottom: "3em",
				flexDirection: "column",
			}}
		>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one implementation status must be selected`}
			/>
			<Grid
				container
				spacing={2}
			>
				{allFunds.map(fund => {
					return (
						<Grid size={2.4}>
							<AttributionCard
								donorValue={attributions[fund].donor}
								totalValue={attributions[fund].total}
								percentage={attributions[fund].percentage}
								key={fund}
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
		</Box>
	);
}

export default AttributionCardsContainer;
