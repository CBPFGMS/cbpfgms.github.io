import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { SyntheticEvent, useMemo, useRef, useState } from "react";
import Snack from "./Snack";
import { SearchProps } from "../types";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function Search({
	value,
	setValue,
	names,
	namesList,
	inSelectionData,
	dataProperty,
}: SearchProps) {
	let isAllSelected = value.length === names.length;

	const selectRef = useRef<HTMLDivElement | null>(null);
	const [dropdownHeight, setDropdownHeight] = useState<number>(450);

	const [openSnack, setOpenSnack] = useState<boolean>(false);

	function handleChange(_: SyntheticEvent, eventValue: number[]) {
		if (eventValue.length === 0) {
			setValue(value);
			setOpenSnack(true);
			return;
		}
		if (isAllSelected) {
			const missingItems: number[] = names.filter(
				d => !eventValue.includes(d)
			);
			setValue(missingItems);
		} else {
			eventValue.sort((a, b) => namesList[a].localeCompare(namesList[b]));
			setValue(eventValue);
		}
		isAllSelected = eventValue.length !== names.length;
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
		names.sort((a, b) => namesList[a].localeCompare(namesList[b]));
		return names;
	}, [names, namesList]);

	return (
		<div
			ref={selectRef}
			style={{ marginBottom: "0.5em" }}
		>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one allocation type must be selected`}
			/>
			<Autocomplete
				onMouseEnter={calculateHeight}
				multiple
				clearIcon={null}
				id="allocation-types-search"
				options={namesListMemo}
				value={value}
				onChange={handleChange}
				disableCloseOnSelect
				renderTags={() => null}
				getOptionLabel={option => namesList[option]}
				renderOption={(props, option) => (
					<li
						{...props}
						key={option}
						style={
							!inSelectionData[dataProperty].has(option)
								? {
										display: "none",
								  }
								: {
										whiteSpace: "normal",
										padding: "1px",
								  }
						}
					>
						<Checkbox
							key={option}
							icon={icon}
							checkedIcon={checkedIcon}
							style={{ marginRight: 8 }}
							checked={value.includes(option)}
							disabled={
								!inSelectionData[dataProperty].has(option)
							}
						/>
						{namesList[option]}
					</li>
				)}
				style={{ maxHeight: dropdownHeight }}
				renderInput={params => (
					<TextField
						{...params}
						label="Allocation Type"
						placeholder="Start typing or use the menu"
					/>
				)}
			/>
		</div>
	);
}

export default Search;
