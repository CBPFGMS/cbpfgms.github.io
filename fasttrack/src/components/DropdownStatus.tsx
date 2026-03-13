import { useMemo } from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { useRef, useState } from "react";
import Snack from "./Snack";
import type { InSelectionData } from "../utils/processdatatopfigures";
import type { ListObj } from "../utils/makelists";

type DropdownStatusProps = {
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	inSelectionData: InSelectionData;
	namesList: ListObj;
};

function DropdownStatus({
	value,
	setValue,
	inSelectionData,
	namesList,
}: DropdownStatusProps) {
	let isAllSelected = inSelectionData.statuses.size === value.length;

	const statusesInData = [...inSelectionData.statuses];

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
			// eslint-disable-next-line
			isAllSelected = eventArray.length !== statusesInData.length;
			const missingItems: number[] = statusesInData.filter(
				d => !eventArray.includes(d),
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
		statusesInData.sort((a, b) => a - b);
		return statusesInData;
	}, [statusesInData]);

	return (
		<div ref={selectRef}>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one implementation status must be selected`}
			/>
			<FormControl
				sx={{
					maxWidth: "100%",
					minWidth: "100%",
				}}
				size={"small"}
			>
				<InputLabel id="multiple-checkbox-label">Status</InputLabel>
				<Select
					labelId="multiple-checkbox-label"
					id="multiple-checkbox"
					multiple
					value={value}
					onChange={handleChange}
					onMouseEnter={calculateHeight}
					input={<OutlinedInput label="Status" />}
					renderValue={selected =>
						isAllSelected
							? "All selected"
							: `${selected.length} selected`
					}
					MenuProps={{
						PaperProps: {
							style: {
								maxHeight: dropdownHeight,
								marginTop: "8px",
							},
						},
						disablePortal: true,
						disableScrollLock: true,
					}}
				>
					{namesListMemo.map(name => (
						<MenuItem
							key={name}
							value={name}
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

export default DropdownStatus;
