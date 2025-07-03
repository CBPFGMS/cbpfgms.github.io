import AccordionComponent from "./Accordion";
import Grid from "@mui/material/Grid";
import { type InSelectionData } from "../utils/processdata";
import Legend from "./Legend";

type SelectorsSummaryProps = {
	year: number[];
	organizationType: number[];
	setYear: React.Dispatch<React.SetStateAction<number[]>>;
	setOrganizationType: React.Dispatch<React.SetStateAction<number[]>>;
	inSelectionData: InSelectionData;
};

function SelectorsSummary({
	year,
	organizationType,
	setYear,
	setOrganizationType,
	inSelectionData,
}: SelectorsSummaryProps) {
	return (
		<Grid
			container
			spacing={4}
			sx={{
				width: "80%",
				margin: "0 auto",
			}}
			alignItems={"center"}
		>
			<Grid size={3}>
				<AccordionComponent
					type="Year"
					dataProperty="years"
					selectionProperty="years"
					value={year}
					setValue={setYear}
					inSelectionData={inSelectionData}
				/>
			</Grid>
			<Grid sx={{ flexGrow: 1 }}>
				<AccordionComponent
					type="Organization Type"
					dataProperty="organizationTypes"
					selectionProperty="organizationTypes"
					value={organizationType}
					setValue={setOrganizationType}
					inSelectionData={inSelectionData}
				/>
			</Grid>
			<Legend />
		</Grid>
	);
}

export default SelectorsSummary;
