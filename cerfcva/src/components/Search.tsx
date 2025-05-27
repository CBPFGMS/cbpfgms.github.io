import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { type SyntheticEvent, useMemo, useRef, useState } from "react";
import Snack from "./Snack";
import { type ListObj } from "../utils/makelists";
import { type InSelectionData } from "./SummaryContainer";
import { type SelectionProperties } from "./Accordion";

type SearchProps = {
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	names: number[];
	namesList: ListObj;
	inSelectionData: InSelectionData;
	selectionProperty: SelectionProperties;
};

const icon = <CheckBoxOutlineBlankIcon fontSize="medium" />;
const checkedIcon = <CheckBoxIcon fontSize="medium" />;

function Search({
	value,
	setValue,
	names,
	namesList,
	inSelectionData,
	selectionProperty,
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
				message={`At least one country must be selected`}
			/>
			<Autocomplete
				onMouseEnter={calculateHeight}
				multiple
				clearIcon={null}
				id="allocation-names-search"
				options={namesListMemo}
				value={value}
				onChange={handleChange}
				disableCloseOnSelect
				renderValue={() => null}
				getOptionLabel={option => namesList[option]}
				getOptionDisabled={option =>
					!inSelectionData[selectionProperty].has(option)
				}
				renderOption={(props, option) => (
					<li
						{...props}
						key={option}
						style={{
							whiteSpace: "normal",
							padding: "1px",
						}}
					>
						<Checkbox
							key={option}
							icon={icon}
							size="large"
							checkedIcon={checkedIcon}
							checked={value.includes(option)}
							disabled={
								!inSelectionData[selectionProperty].has(option)
							}
						/>
						{namesList[option]}
					</li>
				)}
				style={{ maxHeight: dropdownHeight }}
				renderInput={params => (
					<TextField
						{...params}
						label="Country name"
						placeholder="Start typing or use the dropdown menu"
						sx={{
							"& .MuiInputBase-root": {
								paddingRight: "42px !important", // Adjust this value as needed
							},
						}}
					/>
				)}
			/>
		</div>
	);
}

export default Search;
