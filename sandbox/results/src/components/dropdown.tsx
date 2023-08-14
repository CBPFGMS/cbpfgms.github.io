import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

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

type DropdownProps = {
	value: string[];
	setValue: React.Dispatch<React.SetStateAction<string[]>>;
	names: string[];
	type: string;
};

function Dropdown({ value, setValue, names, type }: DropdownProps) {
	function handleChange(event: SelectChangeEvent<typeof value>) {
		const eventArray: string[] = [event.target.value].flat();
		if (type === "Year") {
			eventArray.sort((a, b) => +b - +a);
		}
		setValue(eventArray);
	}

	function handleChangeChip(value: string) {
		setValue(prev => prev.filter(d => d !== value));
	}

	return (
		<div>
			<FormControl sx={{ m: 1, maxWidth: "90%", minWidth: "25%" }}>
				<InputLabel id="multiple-checkbox-label">{type}</InputLabel>
				<Select
					labelId="multiple-checkbox-label"
					id="multiple-checkbox"
					multiple
					value={value}
					onChange={handleChange}
					input={<OutlinedInput label={type} />}
					renderValue={selected => (
						<Box
							sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
						>
							{selected.map(selectValue => (
								<Chip
									key={selectValue}
									label={selectValue}
									onDelete={()=>handleChangeChip(selectValue)}
									onMouseDown={event => {
										event.stopPropagation();
									}}
								/>
							))}
						</Box>
					)}
					MenuProps={MenuProps}
				>
					{names.map(name => (
						<MenuItem
							key={name}
							value={name}
						>
							<Checkbox checked={value.includes(name)} />
							<ListItemText primary={name} />
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
}

export default Dropdown;
