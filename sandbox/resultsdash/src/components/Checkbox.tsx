import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

function CheckboxLabel({ value, setValue, names, namesList }: CheckboxProps) {
	return (
		<FormGroup>
			{names.map((name, index) => (
				<FormControlLabel
					key={index}
					control={
						<Checkbox
							checked={value.includes(name)}
							onChange={() => {
								if (value.includes(name)) {
									setValue(prev =>
										prev.filter(d => d !== name)
									);
								} else {
									setValue(prev => [...prev, name]);
								}
							}}
						/>
					}
					label={namesList[name]}
				/>
			))}
		</FormGroup>
	);
}

export default CheckboxLabel;
