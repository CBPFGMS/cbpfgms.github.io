import { useMemo, useState, useRef } from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import Snack from "./Snack";
import type { ListObj } from "../utils/makelists";

type DropdownDonorsProps = {
	donors: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	allDonors: number[];
	namesList: ListObj;
};

function DropdownDonors({
	donors,
	setValue,
	allDonors,
	namesList,
}: DropdownDonorsProps) {
	const selectRef = useRef<HTMLDivElement | null>(null);
	const [dropdownHeight, setDropdownHeight] = useState<number>(450);
	const isAllSelected = allDonors.length === donors.length;

	const [openSnack, setOpenSnack] = useState<boolean>(false);

	function handleChange(event: SelectChangeEvent<typeof donors>) {
		const eventArray: number[] = [event.target.value as number[]].flat();
		if (eventArray.length === 0) {
			setValue(donors);
			setOpenSnack(true);
			return;
		}
		if (isAllSelected) {
			const missingItems: number[] = allDonors.filter(
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
		allDonors.sort((a, b) => namesList[a].localeCompare(namesList[b]));
		return allDonors;
	}, [allDonors, namesList]);

	return (
		<div ref={selectRef}>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one fund must be selected`}
			/>
			<FormControl
				sx={{
					maxWidth: "100%",
					minWidth: "100%",
				}}
				size={"small"}
			>
				<InputLabel id="multiple-checkbox-label">Donors</InputLabel>
				<Select
					labelId="multiple-checkbox-label"
					id="multiple-checkbox"
					multiple
					value={donors}
					onChange={handleChange}
					onMouseEnter={calculateHeight}
					input={<OutlinedInput label="Donors" />}
					renderValue={selected =>
						isAllSelected
							? "All selected"
							: `${selected.length} selected`
					}
					MenuProps={{
						slotProps: {
							paper: {
								style: {
									maxHeight: dropdownHeight,
									marginTop: "8px",
								},
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
								checked={donors.includes(name)}
								sx={{ padding: "6px" }}
							/>
							<ListItemText
								sx={{
									maxWidth: "280px",
									paddingRight: "1em",
									"& .MuiListItemText-primary": {
										display: "-webkit-box",
										WebkitBoxOrient: "vertical",
										WebkitLineClamp: 1,
										overflow: "hidden",
										overflowWrap: "anywhere",
										whiteSpace: "normal",
										lineHeight: 1.2,
									},
								}}
								primary={namesList[name]}
							/>
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
}

export default DropdownDonors;
