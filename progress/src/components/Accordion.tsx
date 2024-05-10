import { useContext, useRef, useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataContext, { DataContextType } from "../context/DataContext";
import Dropdown from "./Dropdown";
import CheckboxLabel from "./Checkbox";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Search from "./Search";
import { InSelectionData } from "../utils/processdatasummary";
import { InDataLists } from "../utils/processrawdata";
import { List, ListObj, AllocationTypeListObj } from "../utils/makelists";
import constants from "../utils/constants";

const { filterTypes } = constants;

type DataProperties = keyof InSelectionData;

type Type = (typeof filterTypes)[number];

type AccordionComponentProps = {
	type: Type;
	filterType: string;
	dataProperty: DataProperties;
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	expanded: string | false;
	handleAccordionExpand: (
		panel: string
	) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
	inSelectionData: InSelectionData;
};

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
	const [boxHeight, setBoxHeight] = useState<number>(0);
	const accordionRef = useRef<HTMLDivElement>(null);

	const { lists, inDataLists } = useContext(DataContext) as DataContextType;
	const dataArray = [...inDataLists[dataProperty as keyof InDataLists]];
	let namesList: ListObj | AllocationTypeListObj;

	switch (type) {
		case "Fund":
			namesList = lists.fundAbbreviatedNames;
			break;
		case "Year":
			namesList = makeYearsList(dataArray);
			break;
		case "Allocation Source":
			namesList = lists.allocationSources;
			break;
		case "Allocation Type":
			namesList = lists.allocationTypes;
			break;
		default:
			namesList = lists[dataProperty as keyof List] as never;
	}

	function handleDeselectAll() {
		setValue([]);
	}

	function handleSelectAll() {
		setValue(dataArray);
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
			<Accordion
				expanded={expanded === type}
				onChange={handleAccordionExpand(type)}
				style={{
					backgroundColor: "#ffffff",
					position: "absolute",
					zIndex: 1000,
					maxWidth: "100%",
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
							? `All ${type}s selected`
							: value.length === 1
							? isValidKey(value[0], namesList)
								? namesList[value[0]]
								: value[0].toString()
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
		</Box>
	);
}

function makeYearsList(dataArray: number[]): ListObj {
	const yearsList: ListObj = {};
	dataArray.forEach(year => {
		yearsList[year] = year.toString();
	});
	return yearsList;
}

function isValidKey(
	key: number,
	obj: ListObj | AllocationTypeListObj
): key is keyof typeof obj {
	return key in obj;
}

export default AccordionComponent;
