import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { useRef, useState } from "react";
import Snack from "./Snack";
import type { Statuses } from "./MainContainer";
import { constants } from "../utils/constants";

type DropdownStatusProps = {
	value: Statuses[];
	setValue: React.Dispatch<React.SetStateAction<Statuses[]>>;
};

const { projectStatus } = constants;

type ShortNamesList = {
	[K in Statuses]: string;
};

const shortNamesList: ShortNamesList = projectStatus.reduce((acc, curr) => {
	acc[curr.value] = curr.label;
	return acc;
}, {} as ShortNamesList);

function DropdownStatus({ value, setValue }: DropdownStatusProps) {
	const allStatuses = projectStatus.map(status => status.value);
	let isAllSelected = value.length === allStatuses.length;

	const selectRef = useRef<HTMLDivElement | null>(null);
	const [dropdownHeight, setDropdownHeight] = useState<number>(450);

	const [openSnack, setOpenSnack] = useState<boolean>(false);

	function handleChange(event: SelectChangeEvent<typeof value>) {
		const eventArray: Statuses[] = [
			event.target.value as Statuses[],
		].flat();
		if (eventArray.length === 0) {
			setValue(value);
			setOpenSnack(true);
			return;
		}
		if (isAllSelected) {
			// eslint-disable-next-line
			isAllSelected = eventArray.length !== allStatuses.length;
			const missingItems: Statuses[] = allStatuses.filter(
				d => !eventArray.includes(d),
			);
			setValue(missingItems);
		} else {
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
					{allStatuses.map(name => (
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
								primary={shortNamesList[name]}
							/>
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
}

export default DropdownStatus;
