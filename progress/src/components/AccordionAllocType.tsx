import { useContext, useRef, useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataContext, { DataContextType } from "../context/DataContext";
import Box from "@mui/material/Box";
import Search from "./Search";
import { InSelectionData } from "../utils/processdatasummary";
import { FundWithAllocType } from "../utils/processrawdata";
import Button from "@mui/material/Button";

type AccordionAllocTypeProps = {
	value: FundWithAllocType[];
	setValue: React.Dispatch<React.SetStateAction<FundWithAllocType[]>>;
	inSelectionData: InSelectionData;
};

function AccordionAllocType({
	value,
	setValue,
	inSelectionData,
}: AccordionAllocTypeProps) {
	const type = "Allocation Name";
	const [expanded, setExpanded] = useState<string | false>(false);
	const [boxHeight, setBoxHeight] = useState<number>(0);
	const accordionRef = useRef<HTMLDivElement>(null);

	const { lists, inDataLists } = useContext(DataContext) as DataContextType;
	const dataArray = [...inDataLists.allocationTypes];
	const namesList = lists.allocationTypes;

	const handleAccordionExpand =
		(panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
			setExpanded(isExpanded ? panel : false);
		};

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
								width: "65%",
								textAlign: "center",
								minWidth: 0,
								display: "-webkit-box",
								WebkitBoxOrient: "vertical",
								WebkitLineClamp: 3,
								overflow: "hidden",
								textOverflow: "ellipsis",
								wordBreak: "break-word",
							}}
						>
							{value.length === dataArray.length
								? `All ${type.toLocaleLowerCase()}s selected`
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
						<Search
							value={value}
							setValue={setValue}
							names={dataArray}
							namesList={namesList}
							inSelectionData={inSelectionData}
							dataProperty={"allocationTypes"}
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
								onClick={handleSelectAll}
								style={{
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

function isValidKey(
	key: FundWithAllocType,
	obj: { [key: FundWithAllocType]: string },
): boolean {
	return key in obj;
}

export default AccordionAllocType;
