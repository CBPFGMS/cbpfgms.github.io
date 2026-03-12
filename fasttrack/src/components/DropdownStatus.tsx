// import OutlinedInput from "@mui/material/OutlinedInput";
// import InputLabel from "@mui/material/InputLabel";
// import MenuItem from "@mui/material/MenuItem";
// import FormControl from "@mui/material/FormControl";
// import ListItemText from "@mui/material/ListItemText";
// import Select, { type SelectChangeEvent } from "@mui/material/Select";
// import Checkbox from "@mui/material/Checkbox";
// import { useRef, useState } from "react";
// import Snack from "./Snack";
// import { constants } from "../utils/constants";
// import type { InSelectionData } from "../utils/processdatatopfigures";

// type DropdownStatusProps = {
// 	value: number[];
// 	setValue: React.Dispatch<React.SetStateAction<number[]>>;
// 	inSelectionData: InSelectionData;
// };

// const { projectStatusMaster } = constants;

// function DropdownStatus({
// 	value,
// 	setValue,
// 	inSelectionData,
// }: DropdownStatusProps) {
// 	const statusesInData = projectStatusMaster.filter(d =>
// 		d.values.some(e => inSelectionData.statuses.has(e)),
// 	);

// 	const statusesLabelsArray = statusesInData.map(d => d.label);

// 	let isAllSelected = [...inSelectionData.statuses].every(d =>
// 		statusesInData.some(e => (e.values as readonly number[]).includes(d)),
// 	);

// 	const selectRef = useRef<HTMLDivElement | null>(null);
// 	const [dropdownHeight, setDropdownHeight] = useState<number>(450);

// 	const [openSnack, setOpenSnack] = useState<boolean>(false);

// 	function handleChange(event: SelectChangeEvent<typeof value>) {
// 		//HERE, the event array are the labels
// 		const eventArray: string[] = [
// 			event.target.value as unknown as string[],
// 		].flat();
// 		console.log(eventArray);
// 		console.log(isAllSelected);
// 		if (eventArray.length === 0) {
// 			setValue(value);
// 			setOpenSnack(true);
// 			return;
// 		}
// 		if (isAllSelected) {
// 			// eslint-disable-next-line
// 			isAllSelected = eventArray.length === statusesInData.length;
// 			const missingItems = statusesInData.filter(
// 				d => !eventArray.includes(d.label),
// 			);
// 			const missingItemsIds = missingItems.flatMap(d => d.values);
// 			setValue(missingItemsIds);
// 		} else {
// 			const ids = statusesInData
// 				.filter(d => eventArray.includes(d.label))
// 				.flatMap(d => d.values);
// 			setValue(ids);
// 		}
// 	}

// 	function calculateHeight() {
// 		if (selectRef.current) {
// 			const selectRect = selectRef.current.getBoundingClientRect();
// 			const windowHeight = window.innerHeight;
// 			const remainingSpace = windowHeight - selectRect.bottom;
// 			setDropdownHeight(remainingSpace);
// 		}
// 	}

// 	return (
// 		<div ref={selectRef}>
// 			<Snack
// 				openSnack={openSnack}
// 				setOpenSnack={setOpenSnack}
// 				message={`At least one implementation status must be selected`}
// 			/>
// 			<FormControl
// 				sx={{
// 					maxWidth: "100%",
// 					minWidth: "100%",
// 				}}
// 				size={"small"}
// 			>
// 				<InputLabel id="multiple-checkbox-label">Status</InputLabel>
// 				<Select
// 					labelId="multiple-checkbox-label"
// 					id="multiple-checkbox"
// 					multiple
// 					value={statusesLabelsArray}
// 					onChange={handleChange}
// 					onMouseEnter={calculateHeight}
// 					input={<OutlinedInput label="Status" />}
// 					renderValue={selected =>
// 						isAllSelected
// 							? "All selected"
// 							: `${selected.length} selected`
// 					}
// 					MenuProps={{
// 						PaperProps: {
// 							style: {
// 								maxHeight: dropdownHeight,
// 								marginTop: "8px",
// 							},
// 						},
// 						disablePortal: true,
// 						disableScrollLock: true,
// 					}}
// 				>
// 					{statusesInData.map(name => (
// 						<MenuItem
// 							key={name.label}
// 							value={name.label}
// 							style={{
// 								whiteSpace: "normal",
// 								padding: "1px",
// 							}}
// 						>
// 							<Checkbox
// 								checked={name.values.some(d =>
// 									value.includes(d),
// 								)}
// 								sx={{ padding: "6px" }}
// 							/>
// 							<ListItemText
// 								style={{ maxWidth: "500px" }}
// 								primary={name.label}
// 							/>
// 						</MenuItem>
// 					))}
// 				</Select>
// 			</FormControl>
// 		</div>
// 	);
// }

// export default DropdownStatus;
