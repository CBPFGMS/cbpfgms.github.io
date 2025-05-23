import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { useMemo, useRef, useState } from "react";
import Snack from "./Snack";
import { type ListObj } from "../utils/makelists";
import { type InSelectionData } from "./SummaryContainer";
import type { Type, SelectionProperties } from "./Accordion";

type DropdownProps = {
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	names: number[];
	namesList: ListObj;
	type: Type;
	inSelectionData: InSelectionData;
	selectionProperty: SelectionProperties;
};

function Dropdown({
	value,
	setValue,
	names,
	namesList,
	type,
	inSelectionData,
	selectionProperty,
}: DropdownProps) {
	let isAllSelected = value.length === names.length;

	const selectRef = useRef<HTMLDivElement | null>(null);
	const [dropdownHeight, setDropdownHeight] = useState<number>(450);

	const [openSnack, setOpenSnack] = useState<boolean>(false);

	function handleChange(event: SelectChangeEvent<typeof value>) {
		const eventArray: number[] = [event.target.value as number[]].flat();
		if (eventArray.length === 0) {
			setValue(value);
			setOpenSnack(true);
			return;
		}
		if (isAllSelected) {
			isAllSelected = eventArray.length !== names.length;
			const missingItems: number[] = names.filter(
				d => !eventArray.includes(d)
			);
			setValue(missingItems);
		} else {
			eventArray.sort((a, b) => namesList[a].localeCompare(namesList[b]));
			setValue(eventArray);
		}
	}

	function calculateHeight() {
		if (selectRef.current) {
			const selectRect = selectRef.current.getBoundingClientRect();
			const windowHeight = window.innerHeight;
			const remainingSpace = windowHeight - selectRect.bottom;
			setDropdownHeight(remainingSpace);
		}
	}

	const namesListMemo = useMemo(() => {
		names.sort((a, b) =>
			type === "Year" ? b - a : namesList[a].localeCompare(namesList[b])
		);
		return names;
	}, [names, namesList, type]);

	return (
		<div ref={selectRef}>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one ${type.toLocaleLowerCase()} must be selected`}
			/>
			<FormControl
				sx={{ m: 1, maxWidth: "95%", minWidth: "95%" }}
				size={"medium"}
			>
				<InputLabel id="multiple-checkbox-label">{type}</InputLabel>
				<Select
					labelId="multiple-checkbox-label"
					id="multiple-checkbox"
					multiple
					value={value}
					onChange={handleChange}
					onMouseEnter={calculateHeight}
					input={<OutlinedInput label={type} />}
					renderValue={selected =>
						(selected as number[]).map(d => namesList[d]).join(", ")
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
					{namesListMemo.map(name => (
						<MenuItem
							key={name}
							value={name}
							disabled={
								!inSelectionData[selectionProperty].has(name)
							}
							style={{
								whiteSpace: "normal",
								padding: "1px",
							}}
						>
							<Checkbox
								checked={value.includes(name)}
								sx={{ padding: "6px" }}
							/>
							<ListItemText
								style={{ maxWidth: "500px" }}
								primary={namesList[name]}
							/>
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
}

export default Dropdown;
