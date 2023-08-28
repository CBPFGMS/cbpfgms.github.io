import { useContext } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataContext from "../context/DataContext";
import Dropdown from "./Dropdown";
import CheckboxLabel from "./Checkbox";
import Button from "@mui/material/Button";

function AccordionComponent({
	type,
	dataProperty,
	filterType,
	value,
	setValue,
	expanded,
	handleAccordionExpand,
}: AccordionComponentProps) {
	const apiData = useContext(DataContext) as DataContext;
	const lists = apiData.lists;
	const dataArray = [
		...apiData.inDataLists[dataProperty as keyof InDataLists],
	];
	const namesList =
		type === "Fund"
			? lists.fundAbbreviatedNames
			: lists[dataProperty as keyof List];

	function handleButtonClick() {
		setValue([]);
	}

	return (
		<Accordion
			expanded={expanded === type}
			onChange={handleAccordionExpand(type)}
		>
			<AccordionSummary
				expandIcon={<ExpandMoreIcon />}
				sx={{
					width: "100%",
					height: "66px",
				}}
			>
				<Typography
					sx={{
						color: "#144372",
						fontWeight: "bold",
						fontSize: "1rem",
						width: "30%",
					}}
				>
					{type + ":"}
				</Typography>
				<Typography sx={{ flexGrow: 1 }} />
				<Typography
					sx={{
						color: "text.secondary",
						alignSelf: "center",
						justifySelf: "flex-end",
						fontSize: "0.8rem",
						width: "40%",
					}}
				>
					{value.length === dataArray.length
						? `All ${type}s selected`
						: value.length < 6
						? value.reduce(function (acc, curr, index) {
								return (
									acc +
									(index >= value.length - 2
										? index > value.length - 2
											? namesList[curr]
											: namesList[curr] + " and "
										: namesList[curr] + ", ")
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
					Select the {type.toLocaleLowerCase()}.{" "}
					{filterType === "dropdowncheck" &&
						`Multiple ${type.toLocaleLowerCase()}s are allowed.`}
				</Typography>
				{filterType === "dropdowncheck" && (
					<Dropdown
						value={value}
						setValue={setValue}
						names={dataArray}
						namesList={namesList as ListObj}
						type={type}
					/>
				)}
				{filterType === "checkbox" && (
					<CheckboxLabel
						value={value}
						setValue={setValue}
						names={dataArray}
						namesList={namesList as ListObj}
					/>
				)}
				{filterType === "dropdowncheck" && (
					<Button
						variant="contained"
						size="small"
						onClick={handleButtonClick}
						style={{ marginLeft: "8px" }}
					>
						Deselect all
					</Button>
				)}
			</AccordionDetails>
		</Accordion>
	);
}

export default AccordionComponent;
