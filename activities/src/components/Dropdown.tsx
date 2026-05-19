import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { useMemo, useRef, useState } from "react";
import Snack from "./Snack";
import type { ListObj } from "../utils/makelists";
import type { InSelectionData } from "../utils/filterData";
import { constants } from "../utils/constants";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

type Type = (typeof constants.filterTypes)[number];

type DataProperties = keyof InSelectionData;

type DropdownProps = {
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	names: number[];
	namesList: ListObj;
	type: Type;
	inFiltersData: InSelectionData;
	dataProperty: DataProperties;
};

function Dropdown({
	value,
	setValue,
	names,
	namesList,
	type,
	inFiltersData,
	dataProperty,
}: DropdownProps) {
	const isAllSelected = value.length === names.length;

	const selectRef = useRef<HTMLDivElement | null>(null);

	const [openSnack, setOpenSnack] = useState<boolean>(false);

	function handleChange(event: SelectChangeEvent<typeof value>) {
		const eventArray: number[] = [event.target.value as number[]].flat();
		if (eventArray.length === 0) {
			setValue(value);
			setOpenSnack(true);
			return;
		}
		if (isAllSelected && eventArray.length !== names.length) {
			const missingItems: number[] = names.filter(
				d => !eventArray.includes(d),
			);
			setValue(missingItems);
		} else {
			eventArray.sort((a, b) => namesList[a].localeCompare(namesList[b]));
			setValue(eventArray);
		}
	}

	const namesListMemo = useMemo(() => {
		names.sort((a, b) => namesList[a].localeCompare(namesList[b]));
		return names;
	}, [names, namesList]);

	const snackType =
		type === "Statuses"
			? "status"
			: type.toLocaleLowerCase().substring(0, type.length - 1);

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-end",
			}}
			ref={selectRef}
		>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one ${snackType} must be selected`}
			/>
			<FormControl
				sx={{
					maxWidth: "100%",
					minWidth: "100%",
				}}
				size={"small"}
			>
				<InputLabel id="multiple-checkbox-label">{type}</InputLabel>
				<Select
					labelId="multiple-checkbox-label"
					id="multiple-checkbox"
					multiple
					value={value}
					onChange={handleChange}
					input={<OutlinedInput label={type} />}
					renderValue={selected =>
						isAllSelected
							? "All selected"
							: `${selected.length} selected`
					}
					MenuProps={{
						PaperProps: {
							style: {
								maxHeight: names.length * 38,
							},
						},
					}}
				>
					{namesListMemo.map(name => (
						<MenuItem
							key={name}
							value={name}
							disabled={!inFiltersData[dataProperty].has(name)}
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
			<Button
				size="small"
				variant="contained"
				disabled={value.length === names.length}
				onClick={() => {
					setValue(names);
				}}
				sx={{
					padding: "2px 8px",
					minWidth: "auto",
					fontSize: "0.8rem",
					fontFamily: '"Roboto Mono", monospace',
					fontWeight: 700,
					textTransform: "none",
					mt: 1,
					borderRadius: "12px",
				}}
			>
				<Typography sx={{ fontSize: "1em" }}>Select all</Typography>
			</Button>
		</Box>
	);
}

export default Dropdown;
