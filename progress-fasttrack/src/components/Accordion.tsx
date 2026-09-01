import { useContext, useRef, useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataContext, { DataContextType } from "../context/DataContext";
import { Tranche } from "./MainContainer";
import Dropdown from "./Dropdown";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { InSelectionData } from "../utils/processdatasummary";
import { InDataLists } from "../utils/processrawdata";
import { ListObj } from "../utils/makelists";
import constants from "../utils/constants";

const { filterTypes } = constants;

export type DataProperties = keyof InSelectionData;

export type Type = (typeof filterTypes)[number];

type AccordionComponentProps = {
	type: Type;
	filterType: string;
	dataProperty: DataProperties;
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	inSelectionData: InSelectionData;
	tranche: Tranche;
};

type InDataListsWithoutStatusesPerFund = Omit<
	InDataLists,
	| "statusesPerFund"
	| "fundsPerTranche"
	| "projectsPerTranche"
	| "fundsPerBeneficiaryType"
>;

function AccordionComponent({
	type,
	dataProperty,
	value,
	setValue,
	inSelectionData,
	tranche,
}: AccordionComponentProps) {
	void inSelectionData;

	const [expanded, setExpanded] = useState<string | false>(false);
	const [boxHeight, setBoxHeight] = useState<number>(0);
	const accordionRef = useRef<HTMLDivElement>(null);

	const { lists, inDataLists } = useContext(DataContext) as DataContextType;
	const dataArray = [
		...inDataLists[dataProperty as keyof InDataListsWithoutStatusesPerFund],
	];
	const fundsInTranche =
		tranche !== "all"
			? [...inDataLists.fundsPerTranche[tranche]]
			: dataArray;
	const namesList = lists.fundNames;

	const handleAccordionExpand =
		(panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
			setExpanded(isExpanded ? panel : false);
		};

	function handleSelectAll() {
		setValue(fundsInTranche);
	}

	function handleClickAway() {
		setExpanded(false);
	}

	// switch (type) {
	// 	case "Fund":
	// 		namesList = lists.fundNames;
	// 		break;
	// 	case "Year":
	// 		namesList = makeYearsList(dataArray);
	// 		break;
	// 	case "Allocation Source":
	// 		namesList = lists.allocationSources;
	// 		break;
	// 	case "Allocation Name":
	// 		namesList = lists.allocationTypes;
	// 		break;
	// 	default:
	// 		namesList = lists[dataProperty as keyof List] as never;
	// }

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
							{value.length === fundsInTranche.length
								? `All ${type.toLocaleLowerCase()}s selected${tranche !== "all" ? ` (for tranche ${tranche})` : ""}`
								: value.length === 1
									? isValidKey(value[0], namesList)
										? namesList[value[0]]
										: value[0].toString()
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
							Select the {type.toLocaleLowerCase()}. Multiple{" "}
							{type.toLocaleLowerCase()}s are allowed.
						</Typography>

						<Dropdown
							value={value}
							setValue={setValue}
							names={dataArray}
							namesList={namesList}
							type={type}
							fromQuickSelectors={false}
							fundsInTranche={fundsInTranche}
						/>
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
								onClick={handleSelectAll}
								style={{
									marginLeft: "8px",
									marginTop: type === "Year" ? "8px" : "0px",
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

export default AccordionComponent;
