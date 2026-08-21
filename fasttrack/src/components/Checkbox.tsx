import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Snack from "./Snack";
import { useState } from "react";
import type { Tranche } from "./MainContainer";
import { constants } from "../utils/constants";
import type { InDataLists } from "../utils/processrawdata";

type CheckboxProps = {
	value: Tranche;
	setValue: React.Dispatch<React.SetStateAction<Tranche>>;
	fromTopContainer?: boolean;
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	inDataLists: InDataLists;
};

const tranches: readonly Tranche[] = constants.tranches;

function CheckboxLabel({
	value,
	setValue,
	fromTopContainer = false,
	setFund,
	inDataLists,
}: CheckboxProps) {
	const [openSnack, setOpenSnack] = useState<boolean>(false);

	function handleChange(
		tranche: (typeof trancheNumbers)[number],
		value: Tranche,
	) {
		if (value === tranche) {
			setOpenSnack(true);
			return;
		}
		if (value === "all") {
			const thisTranche = trancheNumbers.filter(d => d !== tranche)[0];
			setValue(thisTranche);
			setFund([...inDataLists.fundsPerTranche[thisTranche]]);
		} else {
			setValue("all");
			setFund([...inDataLists.funds]);
		}
	}

	const trancheNumbers = tranches.filter(d => d !== "all");

	return (
		<>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one tranche must be selected`}
			/>
			<FormGroup
				row={fromTopContainer}
				sx={{
					gap: fromTopContainer ? "16px" : "0px",
				}}
			>
				{trancheNumbers.map((tranche, index) => (
					<FormControlLabel
						key={index}
						control={
							<Checkbox
								checked={value === "all" || value === tranche}
								onChange={() => {
									handleChange(tranche, value);
								}}
							/>
						}
						label={`Tranche ${tranche}`}
					/>
				))}
			</FormGroup>
		</>
	);
}

export default CheckboxLabel;
