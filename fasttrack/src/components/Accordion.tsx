import { useContext, useRef, useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataContext, { type DataContextType } from "../context/DataContext";
import Dropdown from "./Dropdown";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import type { InSelectionData } from "../utils/processdatatopfigures";
import type { ListObj } from "../utils/makelists";

type AccordionComponentProps = {
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	inSelectionData: InSelectionData;
};

function AccordionComponent({
	value,
	setValue,
	inSelectionData,
}: AccordionComponentProps) {
	const [expanded, setExpanded] = useState<boolean>(false);
	const [boxHeight, setBoxHeight] = useState<number>(0);
	const accordionRef = useRef<HTMLDivElement>(null);

	const { lists, inDataLists } = useContext(DataContext) as DataContextType;
	const dataArray = [...inDataLists.funds];
	const namesList = lists.fundNames;

	function handleAccordionExpand() {
		setExpanded(!expanded);
	}

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
					expanded={expanded}
					onChange={handleAccordionExpand}
					style={{
						backgroundColor: "#ffffff",
						zIndex: 1000,
						maxWidth: "100%",
					}}
					ref={accordionRef}
				>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						sx={{
							width: "100%",
							// height: "66px",
							overflow: "hidden",
							height: "46px", // Set your desired height
							minHeight: "46px", // Ensure minHeight matches to override default
							"& .MuiAccordionSummary-content": {
								margin: 0, // Removes the extra margin that forces the height up
							},
							"&.Mui-expanded": {
								minHeight: "46px", // Keeps it from growing when expanded
							},
							"& .MuiAccordionSummary-content.Mui-expanded": {
								margin: 0, // Keeps margin at 0 when expanded
							},
						}}
					>
						<Typography sx={{ flexGrow: 1 }} />
						<Typography
							sx={{
								color: "text.secondary",
								alignSelf: "center",
								justifySelf: "flex-end",
								fontSize: "0.8rem",
								width: "80%",
								textAlign: "right",
								paddingRight: "8px",
							}}
						>
							{value.length === dataArray.length
								? `All funds selected`
								: value.length < 4
									? createListFromArray(value, namesList)
									: `${value.length} funds selected`}
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography
							variant="body2"
							m={1}
							mb={2}
						>
							Select the fund. Multiple funds are allowed.
						</Typography>
						<Dropdown
							value={value}
							setValue={setValue}
							names={dataArray}
							namesList={namesList}
							inSelectionData={inSelectionData}
						/>

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
								style={{
									marginLeft: "8px",
									marginTop: "0px",
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
									marginTop: "0px",
								}}
							>
								Select all
							</Button>
						</Box>
					</AccordionDetails>
				</Accordion>
			</ClickAwayListener>
		</Box>
	);
}

function isValidKey(key: number, obj: ListObj): boolean {
	return key in obj;
}

function createListFromArray(arr: number[], namesList: ListObj): string {
	const list = arr.reduce(function (acc, curr, index) {
		const currentValue = isValidKey(curr, namesList)
			? namesList[curr]
			: curr.toString();
		return (
			acc +
			(index >= arr.length - 2
				? index > arr.length - 2
					? currentValue
					: currentValue + " and "
				: currentValue + ", ")
		);
	}, "");
	return list;
}

export default AccordionComponent;
