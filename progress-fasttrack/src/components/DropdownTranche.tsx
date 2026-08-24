import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { useRef, useState, useContext } from "react";
import Snack from "./Snack";
import { Tranche } from "./MainContainer";
import DataContext, { DataContextType } from "../context/DataContext";
import constants from "../utils/constants";

type DropdownTrancheProps = {
	value: Tranche;
	setValue: React.Dispatch<React.SetStateAction<Tranche>>;
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
};

const tranches: readonly Tranche[] = constants.tranches;

function DropdownTranche({ value, setValue, setFund }: DropdownTrancheProps) {
	const { inDataLists } = useContext(DataContext) as DataContextType;

	const selectRef = useRef<HTMLDivElement | null>(null);
	const [dropdownHeight, setDropdownHeight] = useState<number>(450);

	const [openSnack, setOpenSnack] = useState<boolean>(false);

	function handleChange(event: SelectChangeEvent<typeof trancheNumbers>) {
		const selectedValues = event.target.value as typeof trancheNumbers;
		if (selectedValues.length === 0) {
			setOpenSnack(true);
			return;
		}
		if (selectedValues.length === 1) {
			setValue(selectedValues[0]);
			setFund([...inDataLists.fundsPerTranche[selectedValues[0]]]);
		} else {
			setValue("all");
			setFund([...inDataLists.funds]);
		}
	}

	const trancheNumbers = tranches.filter(d => d !== "all");

	function calculateHeight() {
		if (selectRef.current) {
			const selectRect = selectRef.current.getBoundingClientRect();
			const windowHeight = window.innerHeight;
			const remainingSpace = windowHeight - selectRect.bottom;
			setDropdownHeight(remainingSpace);
		}
	}

	return (
		<div ref={selectRef}>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one tranche must be selected`}
			/>
			<FormControl
				sx={{
					maxWidth: "100%",
					minWidth: "100%",
				}}
				size={"small"}
			>
				<InputLabel id="multiple-checkbox-label">Tranche</InputLabel>
				<Select
					labelId="multiple-checkbox-label"
					id="multiple-checkbox"
					multiple
					value={value === "all" ? trancheNumbers : [value]}
					onChange={handleChange}
					onMouseEnter={calculateHeight}
					input={<OutlinedInput label="Status" />}
					renderValue={() =>
						value === "all"
							? `All selected`
							: `Tranche ${value} selected`
					}
					MenuProps={{
						PaperProps: {
							style: {
								maxHeight: dropdownHeight,
								marginTop: "8px",
							},
						},
						disablePortal: true,
					}}
				>
					{trancheNumbers.map(thisTranche => (
						<MenuItem
							key={thisTranche}
							value={thisTranche}
							style={{
								whiteSpace: "normal",
								padding: "1px",
							}}
						>
							<Checkbox
								checked={
									value === "all" || value === thisTranche
								}
								sx={{ padding: "6px" }}
							/>
							<ListItemText
								style={{ maxWidth: "500px" }}
								primary={`Tranche ${thisTranche}`}
							/>
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
}

export default DropdownTranche;
