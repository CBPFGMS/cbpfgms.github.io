import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Snack from "./Snack";
import { useContext, useState } from "react";
import type { Tranche } from "./MainContainer";
import constants from "../utils/constants";
import DataContext, { DataContextType } from "../context/DataContext";

type CheckboxProps = {
	value: Tranche;
	setValue: React.Dispatch<React.SetStateAction<Tranche>>;
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
};

const tranches: readonly Tranche[] = constants.tranches;

function CheckboxLabel({ value, setValue, setFund }: CheckboxProps) {
	const { inDataLists } = useContext(DataContext) as DataContextType;

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
			<FormGroup>
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
