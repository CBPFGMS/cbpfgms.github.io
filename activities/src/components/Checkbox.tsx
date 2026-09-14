import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Snack from "./Snack";
import { useState } from "react";
import type { Tranche } from "./MainContainer";
import { constants } from "../utils/constants";
import colors from "../utils/colors";

type CheckboxProps = {
	tranche: Tranche;
	setTranche: React.Dispatch<React.SetStateAction<Tranche>>;
	setSectors: React.Dispatch<React.SetStateAction<number[]>>;
	setActivities: React.Dispatch<React.SetStateAction<number[]>>;
};

const tranches: readonly Tranche[] = constants.tranches;

function CheckboxLabel({
	tranche,
	setTranche,
	setSectors,
	setActivities,
}: CheckboxProps) {
	const [openSnack, setOpenSnack] = useState<boolean>(false);

	function handleChange(
		thisTranche: (typeof trancheNumbers)[number],
		tranche: Tranche,
	) {
		if (tranche === thisTranche) {
			setOpenSnack(true);
			return;
		}
		if (tranche === "all") {
			setTranche(trancheNumbers.filter(d => d !== thisTranche)[0]);
			setSectors([]);
			setActivities([]);
		} else {
			setTranche("all");
			setSectors([]);
			setActivities([]);
		}
	}

	const trancheNumbers = tranches.filter(d => d !== "all");

	return (
		<Paper
			elevation={0}
			sx={{
				paddingTop: 1,
				paddingBottom: 1,
				paddingLeft: 3,
				paddingRight: 2,
				border: "1px solid #ccc",
				borderRadius: 4,
				width: "fit-content",
				marginBottom: 2,
				backgroundColor: colors.unBackground,
			}}
		>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one tranche must be selected`}
			/>
			<FormGroup
				row={true}
				sx={{
					gap: "16px",
				}}
			>
				{trancheNumbers.map((thisTranche, index) => (
					<FormControlLabel
						key={index}
						control={
							<Checkbox
								checked={
									tranche === "all" || tranche === thisTranche
								}
								onChange={() => {
									handleChange(thisTranche, tranche);
								}}
							/>
						}
						label={`Tranche ${thisTranche}`}
					/>
				))}
			</FormGroup>
		</Paper>
	);
}

export default CheckboxLabel;
