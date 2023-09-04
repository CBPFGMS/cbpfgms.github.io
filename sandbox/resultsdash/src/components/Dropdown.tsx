import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { useMemo } from "react";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
};

function Dropdown({ value, setValue, names, namesList, type }: DropdownProps) {
	function handleChange(event: SelectChangeEvent<typeof value>) {
		const eventArray: number[] = [event.target.value as number[]].flat();
		eventArray.sort((a, b) => namesList[a].localeCompare(namesList[b]));
		setValue(eventArray);
	}

	const namesListMemo = useMemo(() => {
		//PROVISORY
		const filteredNames = names.filter(d => namesList[d]);
		filteredNames.sort((a, b) => namesList[a].localeCompare(namesList[b]));
		return filteredNames;
	}, [names, namesList]);

	return (
		<div>
			<FormControl sx={{ m: 1, maxWidth: "95%", minWidth: "95%" }}>
				<InputLabel id="multiple-checkbox-label">{type}</InputLabel>
				<Select
					labelId="multiple-checkbox-label"
					id="multiple-checkbox"
					multiple
					value={value}
					onChange={handleChange}
					input={<OutlinedInput label={type} />}
					renderValue={selected =>
						(selected as number[]).map(d => namesList[d]).join(", ")
					}
					MenuProps={MenuProps}
				>
					{namesListMemo.map(name => (
						<MenuItem
							key={name}
							value={name}
							style={{ whiteSpace: "normal" }}
						>
							<Checkbox checked={value.includes(name)} />
							<ListItemText primary={namesList[name]} />
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
}

export default Dropdown;
