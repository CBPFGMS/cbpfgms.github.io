import { useContext, useRef, useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataContext, { type DataContextType } from "../context/DataContext";
import Dropdown from "./Dropdown";
import CheckboxLabel from "./Checkbox";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Search from "./Search";
import { type InDataLists } from "../utils/processrawdata";
import type { List, ListObj } from "../utils/makelists";
import constants from "../utils/constants";
import { makeYearsList } from "../utils/makeyearslist";
import { type InSelectionData } from "./SummaryContainer";

export type DataProperties = keyof InDataLists;

export type SelectionProperties = keyof InSelectionData;

export type Type =
	| (typeof constants.filtersSummary)[number]
	| (typeof constants.filtersCountries)[number];

export type FilterTypes = (typeof constants.filterTypes)[number];

type AccordionComponentProps = {
	type: Type;
	filterType: FilterTypes;
	dataProperty: DataProperties;
	selectionProperty: SelectionProperties;
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	inSelectionData: InSelectionData;
};

function AccordionComponent({
	type,
	dataProperty,
	selectionProperty,
	filterType,
	value,
	setValue,
	inSelectionData,
}: AccordionComponentProps) {
	const [expanded, setExpanded] = useState<string | false>(false);
	const [boxHeight, setBoxHeight] = useState<number>(0);
	const accordionRef = useRef<HTMLDivElement>(null);

	const { lists, inDataLists } = useContext(DataContext) as DataContextType;
	const dataArray = [...inDataLists[dataProperty as keyof InDataLists]];
	let namesList: ListObj;

	const handleAccordionExpand =
		(panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
			setExpanded(isExpanded ? panel : false);
		};

	function handleDeselectAll() {
		setValue([]);
	}

	function handleSelectAll() {
		setValue(dataArray);
	}

	function handleClickAway() {
		setExpanded(false);
	}

	switch (type) {
		case "Year":
			namesList = makeYearsList(dataArray);
			break;
		case "Allocation Window":
			namesList = lists.allocationSources;
			break;
		case "Country":
			namesList = lists.fundNames;
			break;
		case "Sector":
			namesList = lists.sectors;
			break;
		case "Partner":
			namesList = lists.organizations;
			break;
		default:
			namesList = lists[dataProperty as keyof List] as never;
	}

	useEffect(() => {
		if (accordionRef.current) {
			setBoxHeight(accordionRef.current.clientHeight);
		}
	}, []);

	return (
		<Box
			style={{
				position: "relative",
				height: boxHeight + "px",
			}}
		>
			<ClickAwayListener onClickAway={handleClickAway}>
				<Accordion
					expanded={expanded === type}
					onChange={handleAccordionExpand(type)}
					style={{
						backgroundColor: "#ffffff",
						position: "absolute",
						zIndex: 1000,
						width: "100%",
					}}
					ref={accordionRef}
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
								alignSelf: "center",
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
								textAlign: "center",
							}}
						>
							{value.length === dataArray.length
								? `All ${
										type === "Country"
											? "countrie"
											: type.toLocaleLowerCase()
								  }s selected`
								: value.length === 1
								? isValidKey(value[0], namesList)
									? namesList[value[0]]
									: value[0].toString()
								: `${value.length} ${
										type === "Country"
											? "countrie"
											: type.toLocaleLowerCase()
								  }s selected`}
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
								namesList={namesList}
								type={type}
								inSelectionData={inSelectionData}
								selectionProperty={selectionProperty}
							/>
						)}
						{filterType === "search" && (
							<Search
								value={value}
								setValue={setValue}
								names={dataArray}
								namesList={namesList}
								inSelectionData={inSelectionData}
								selectionProperty={selectionProperty}
							/>
						)}
						{filterType === "checkbox" && (
							<CheckboxLabel
								value={value}
								setValue={setValue}
								names={dataArray}
								namesList={namesList}
								inSelectionData={inSelectionData}
								selectionProperty={selectionProperty}
							/>
						)}
						{(filterType === "dropdowncheck" ||
							filterType === "search") && (
							<Box
								style={{
									display: "flex",
									flexDirection:
										type === "Year" ? "column" : "row",
								}}
							>
								<Button
									variant="contained"
									size="small"
									onClick={handleDeselectAll}
									style={{
										marginLeft: "8px",
										marginTop:
											type === "Year" ? "8px" : "0px",
									}}
								>
									Deselect all
								</Button>
								<Button
									variant="contained"
									size="small"
									onClick={handleSelectAll}
									style={{
										marginLeft: "8px",
										marginTop:
											type === "Year" ? "8px" : "0px",
									}}
								>
									Select all
								</Button>
							</Box>
						)}
					</AccordionDetails>
				</Accordion>
			</ClickAwayListener>
		</Box>
	);
}

function isValidKey(key: number, obj: ListObj): boolean {
	return key in obj;
}

export default AccordionComponent;
