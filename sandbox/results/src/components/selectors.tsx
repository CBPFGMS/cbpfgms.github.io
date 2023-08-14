import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import AccordionComponent from "./accordion";

type SelectorsProps = {
	year: string[];
	setYear: React.Dispatch<React.SetStateAction<string[]>>;
	cbpf: string[];
	setCbpf: React.Dispatch<React.SetStateAction<string[]>>;
	sector: string[];
	setSector: React.Dispatch<React.SetStateAction<string[]>>;
	partnerType: string[];
	setPartnerType: React.Dispatch<React.SetStateAction<string[]>>;
	allocationType: string[];
	setAllocationType: React.Dispatch<React.SetStateAction<string[]>>;
	beneficiaryType: string[];
	setBeneficiaryType: React.Dispatch<React.SetStateAction<string[]>>;
};

function Selectors({
	year,
	setYear,
	cbpf,
	setCbpf,
	sector,
	setSector,
	partnerType,
	setPartnerType,
	allocationType,
	setAllocationType,
	beneficiaryType,
	setBeneficiaryType,
}: SelectorsProps) {
	const [expanded, setExpanded] = useState<string | false>(false);

	const handleAccordionExpand =
		(panel: string) =>
		(_: React.SyntheticEvent, isExpanded: boolean) => {
			setExpanded(isExpanded ? panel : false);
		};

	return (
		<Card
			sx={{
				backgroundColor: "rgb(243, 246, 249)",
				border: "1px solid rgb(229, 234, 242)",
				borderRadius: "12px",
			}}
			variant="outlined"
		>
			<CardContent>
				<Typography
					gutterBottom
					variant="h6"
				>
					Selection Filters
				</Typography>
				<Typography
					gutterBottom
					variant="subtitle1"
					mb={2}
				>
					Click on the arrows to expand the filters, and select their
					values accordingly.
				</Typography>
				<div className="selectorsContainer">
					<AccordionComponent
						type="Year"
						dataProperty="years"
						filterType="dropdowncheck"
						value={year}
						setValue={setYear}
						expanded={expanded}
						handleAccordionExpand={handleAccordionExpand}
					/>
					<AccordionComponent
						type="Fund"
						dataProperty="cbpfs"
						filterType="dropdowncheck"
						value={cbpf}
						setValue={setCbpf}
						expanded={expanded}
						handleAccordionExpand={handleAccordionExpand}
					/>
					<AccordionComponent
						type="Sector"
						dataProperty="sectors"
						filterType="dropdowncheck"
						value={sector}
						setValue={setSector}
						expanded={expanded}
						handleAccordionExpand={handleAccordionExpand}
					/>
					<AccordionComponent
						type="Partner Type"
						dataProperty="partnerTypes"
						filterType="checkbox"
						value={partnerType}
						setValue={setPartnerType}
						expanded={expanded}
						handleAccordionExpand={handleAccordionExpand}
					/>
					<AccordionComponent
						type="Allocation Type"
						dataProperty="allocationTypes"
						filterType="checkbox"
						value={allocationType}
						setValue={setAllocationType}
						expanded={expanded}
						handleAccordionExpand={handleAccordionExpand}
					/>
					<AccordionComponent
						type="Beneficiary Type"
						dataProperty="beneficiaryTypes"
						filterType="checkbox"
						value={beneficiaryType}
						setValue={setBeneficiaryType}
						expanded={expanded}
						handleAccordionExpand={handleAccordionExpand}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

export default Selectors;
