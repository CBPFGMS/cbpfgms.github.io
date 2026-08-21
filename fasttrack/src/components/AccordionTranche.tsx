import { useRef, useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckboxLabel from "./Checkbox";
import Box from "@mui/material/Box";
import type { Tranche } from "./MainContainer";
import type { InDataLists } from "../utils/processrawdata";

type AccordionComponentTrancheProps = {
	value: Tranche;
	setValue: React.Dispatch<React.SetStateAction<Tranche>>;
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	inDataLists: InDataLists;
};

function AccordionComponentTranche({
	value,
	setValue,
	setFund,
	inDataLists,
}: AccordionComponentTrancheProps) {
	const [expanded, setExpanded] = useState<boolean>(false);
	const [boxHeight, setBoxHeight] = useState<number>(0);
	const accordionRef = useRef<HTMLDivElement>(null);

	function handleAccordionExpand() {
		setExpanded(!expanded);
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
				minWidth: 0,
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
							{value === "all"
								? `All tranches selected`
								: `Tranche ${value} selected`}
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<CheckboxLabel
							value={value}
							setValue={setValue}
							setFund={setFund}
							inDataLists={inDataLists}
						/>
					</AccordionDetails>
				</Accordion>
			</ClickAwayListener>
		</Box>
	);
}

export default AccordionComponentTranche;
