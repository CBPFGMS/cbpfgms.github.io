import { useRef, useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckboxLabel from "./CheckboxTranche";
import Box from "@mui/material/Box";
import type { Tranche } from "./MainContainer";

type AccordionComponentTrancheProps = {
	value: Tranche;
	setValue: React.Dispatch<React.SetStateAction<Tranche>>;
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
};

function AccordionComponentTranche({
	value,
	setValue,
	setFund,
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
							{"Tranche:"}
						</Typography>
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
						/>
					</AccordionDetails>
				</Accordion>
			</ClickAwayListener>
		</Box>
	);
}

export default AccordionComponentTranche;
