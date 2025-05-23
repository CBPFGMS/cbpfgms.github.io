import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Snack from "./Snack";
import { useState } from "react";
import { type InSelectionData } from "./SummaryContainer";
import { type ListObj } from "../utils/makelists";
import { type SelectionProperties } from "./Accordion";

type CheckboxProps = {
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	names: number[];
	namesList: ListObj;
	inSelectionData: InSelectionData;
	selectionProperty: SelectionProperties;
};

function CheckboxLabel({
	value,
	setValue,
	names,
	namesList,
	inSelectionData,
	selectionProperty,
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
						disabled={!inSelectionData[selectionProperty].has(name)}
						style={
							!inSelectionData[selectionProperty].has(name)
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
