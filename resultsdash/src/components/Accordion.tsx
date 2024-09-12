import { useContext, useRef, useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataContext from "../context/DataContext";
import Dropdown from "./Dropdown";
import CheckboxLabel from "./Checkbox";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Search from "./Search";
import {
	AccordionComponentProps,
	DataContextType,
	InDataLists,
	List,
	ListObj,
} from "../types";

function AccordionComponent({
	type,
	dataProperty,
	filterType,
	value,
	setValue,
	inSelectionData,
}: AccordionComponentProps) {
	const [expanded, setExpanded] = useState<string | false>(false);
	const [boxHeight, setBoxHeight] = useState<number>(0);
	const accordionRef = useRef<HTMLDivElement>(null);

	const apiData = useContext(DataContext) as DataContextType;
	const lists = apiData.lists;
	const dataArray = [
		...apiData.inDataLists[dataProperty as keyof InDataLists],
	];
	const namesList =
		type === "Fund"
			? lists.fundAbbreviatedNames
			: lists[dataProperty as keyof List];

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
								? `All ${type.toLocaleLowerCase()}s selected`
								: value.length === 1
								? (namesList[value[0]] as string)
								: `${
										value.length
								  } ${type.toLocaleLowerCase()}s selected`}
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
							<Box
								style={{
									display: "flex",
									flexDirection: "row",
								}}
							>
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
			</ClickAwayListener>
		</Box>
	);
}

export default AccordionComponent;
