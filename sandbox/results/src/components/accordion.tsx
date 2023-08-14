import { useContext } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataContext from "../context/DataContext";
import { Idata } from "../data/data";
import Dropdown from "./dropdown";
import CheckboxLabel from "./checkbox";

type AccordionComponentProps = {
	type: string;
	filterType: string;
	dataProperty: string;
	value: string[];
	setValue: React.Dispatch<React.SetStateAction<string[]>>;
	expanded: string | false;
	handleAccordionExpand: (
		panel: string
	) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
};

function AccordionComponent({
	type,
	dataProperty,
	filterType,
	value,
	setValue,
	expanded,
	handleAccordionExpand,
}: AccordionComponentProps) {
	const data = useContext(DataContext);

	return (
		<Accordion
			expanded={expanded === type}
			onChange={handleAccordionExpand(type)}
		>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Typography
					variant="subtitle1"
					sx={{
						color: "#144372",
						fontWeight: "bold",
						width: "30%",
						fontSize: "1.2rem",
					}}
				>
					{type + ":"}
				</Typography>
				<Typography sx={{ color: "text.secondary" }}>
					{value.length === data[dataProperty as keyof Idata].length
						? `All ${type}s selected`
						: value.length < 6
						? value.reduce(function (acc, curr, index) {
								return (
									acc +
									(index >= value.length - 2
										? index > value.length - 2
											? curr
											: curr + " and "
										: curr + ", ")
								);
						  }, "")
						: `${value.length} ${type}s selected`}
				</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Typography
					variant="body2"
					m={1}
				>
					Select the {type.toLocaleLowerCase()}. Multiple{" "}
					{type.toLocaleLowerCase()}s are allowed.
				</Typography>
				{filterType === "dropdowncheck" && (
					<Dropdown
						value={value}
						setValue={setValue}
						names={data[dataProperty as keyof Idata]}
						type={type}
					/>
				)}
				{filterType === "checkbox" && (
					<CheckboxLabel
						value={value}
						setValue={setValue}
						names={data[dataProperty as keyof Idata]}
					/>
				)}
			</AccordionDetails>
		</Accordion>
	);
}

export default AccordionComponent;
