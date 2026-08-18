import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Snack from "./Snack";
import { useState } from "react";
import type { Tranche } from "./MainContainer";

type CheckboxProps = {
	value: Tranche;
	setValue: React.Dispatch<React.SetStateAction<Tranche>>;
};

type TranchesNumbers = 1 | 2;

function CheckboxLabel({ value, setValue }: CheckboxProps) {
	const [openSnack, setOpenSnack] = useState<boolean>(false);

	function handleChange(tranche: TranchesNumbers, value: Tranche) {
		if (value === tranche) {
			setOpenSnack(true);
			return;
		}
		if (value === "all") {
			setValue(tranches.filter(d => d !== tranche)[0]);
		} else {
			setValue("all");
		}
	}

	const tranches: TranchesNumbers[] = [1, 2];

	return (
		<>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one tranche must be selected`}
			/>
			<FormGroup>
				{tranches.map((tranche, index) => (
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
