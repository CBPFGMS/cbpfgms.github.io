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
import Box from "@mui/material/Box";
import Search from "./Search";

function AccordionComponent({
	type,
	dataProperty,
	filterType,
	value,
	setValue,
	expanded,
	handleAccordionExpand,
	inSelectionData,
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

	function handleDeselectAll() {
		setValue([]);
	}

	function handleSelectAll() {
		setValue(dataArray);
	}

	return (
		<Accordion
			expanded={expanded === type}
			onChange={handleAccordionExpand(type)}
			style={{ backgroundColor: "#ffffff" }}
		>
			<AccordionSummary
				expandIcon={<ExpandMoreIcon />}
				sx={{
					width: "100%",
					height: "66px",
					overflow: "hidden",
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
						width: "45%",
					}}
				>
					{value.length === dataArray.length
						? `All ${type}s selected`
						: value.length === 1
						? (namesList[value[0]] as string)
						: `${value.length} ${type}s selected`}
				</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Typography
					variant="body2"
					m={1}
					mb={2}
				>
					Select the {type.toLocaleLowerCase()}
					{filterType === "dropdowncheck" &&
						`. Multiple ${type.toLocaleLowerCase()}s are allowed`}
				</Typography>
				{filterType === "dropdowncheck" && (
					<Dropdown
						value={value}
						setValue={setValue}
						names={dataArray}
						namesList={namesList as ListObj}
						type={type}
						inSelectionData={inSelectionData}
						dataProperty={dataProperty}
						fromQuickSelectors={false}
					/>
				)}
				{filterType === "search" && (
					<Search
						value={value}
						setValue={setValue}
						names={dataArray}
						namesList={namesList as ListObj}
						inSelectionData={inSelectionData}
						dataProperty={dataProperty}
					/>
				)}
				{filterType === "checkbox" && (
					<CheckboxLabel
						value={value}
						setValue={setValue}
						names={dataArray}
						namesList={namesList as ListObj}
						inSelectionData={inSelectionData}
						dataProperty={dataProperty}
					/>
				)}
				{(filterType === "dropdowncheck" ||
					filterType === "search") && (
					<Box style={{ display: "flex", flexDirection: "row" }}>
						<Button
							variant="contained"
							size="small"
							onClick={handleDeselectAll}
							style={{ marginLeft: "8px" }}
						>
							Deselect all
						</Button>
						<Button
							variant="contained"
							size="small"
							onClick={handleSelectAll}
							style={{ marginLeft: "8px" }}
						>
							Select all
						</Button>
					</Box>
				)}
			</AccordionDetails>
		</Accordion>
	);
}

export default AccordionComponent;
