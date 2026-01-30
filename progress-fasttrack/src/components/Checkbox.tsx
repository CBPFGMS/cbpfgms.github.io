import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Snack from "./Snack";
import { useState } from "react";
import { InSelectionData } from "../utils/processdatasummary";
import { ListObj } from "../utils/makelists";
import { DataProperties } from "./Accordion";

type CheckboxProps = {
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	names: number[];
	namesList: ListObj;
	inSelectionData: InSelectionData;
	dataProperty: DataProperties;
};

function CheckboxLabel({
	value,
	setValue,
	names,
	namesList,
	inSelectionData,
	dataProperty,
}: CheckboxProps) {
	const [openSnack, setOpenSnack] = useState<boolean>(false);

	return (
		<>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one allocation source must be selected`}
			/>
			<FormGroup>
				{names.map((name, index) => (
					<FormControlLabel
						key={index}
						disabled={!inSelectionData[dataProperty].has(name)}
						style={
							!inSelectionData[dataProperty].has(name)
								? {
										filter: "grayscale(100%)",
								  }
								: {
										filter: "grayscale(0%)",
								  }
						}
						control={
							<Checkbox
								checked={value.includes(name)}
								onChange={() => {
									if (
										value.length === 1 &&
										value.includes(name)
									) {
										setOpenSnack(true);
										return;
									}
									if (value.includes(name)) {
										setValue(prev =>
											prev.filter(d => d !== name)
										);
									} else {
										setValue(prev => [...prev, name]);
									}
								}}
							/>
						}
						label={namesList[name]}
					/>
				))}
			</FormGroup>
		</>
	);
}

export default CheckboxLabel;
