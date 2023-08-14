import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

type CheckboxProps = {
	value: string[];
	setValue: React.Dispatch<React.SetStateAction<string[]>>;
	names: string[];
};

function CheckboxLabel({ value, setValue, names }: CheckboxProps) {

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
									setValue(prev => prev.filter(d => d !== name));
								} else {
									setValue(prev => [...prev, name]);
								}
							}}
						/>
					}
					label={name}
				/>
			))}
		</FormGroup>
	);
}

export default CheckboxLabel;
