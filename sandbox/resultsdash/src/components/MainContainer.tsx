import { useContext, useState } from "react";
import SelectionContext from "../context/selectioncontext";
import DataContext from "../context/DataContext";
import Grid from "@mui/material/Unstable_Grid2";
import Container from "@mui/material/Container";
import YearSelector from "./YearSelector";
import Selectors from "./Selectors";

function MainContainer() {
	const apiData = useContext(DataContext) as DataContext;

	const lastYear = [...apiData.inDataLists.reportYears].sort(
		(a, b) => b - a
	)[0];

	const [reportYear, setReportYear] = useState<number[]>([lastYear]);
	const [year, setYear] = useState<number[] | null>(null);
	const [allocationType, setAllocationType] = useState<number[]>([
		...apiData.inDataLists.allocationTypes,
	]);
	const [fund, setFund] = useState<number[]>([...apiData.inDataLists.funds]);
	const [allocationSource, setAllocationSource] = useState<number[]>([
		...apiData.inDataLists.allocationSources,
	]);
	const [beneficiaryType, setBeneficiaryType] = useState<number[]>([
		...apiData.inDataLists.beneficiaryTypes,
	]);

	return (
		<SelectionContext.Provider
			value={{
				reportYear,
				setReportYear,
				year,
				setYear,
				allocationType,
				setAllocationType,
				fund,
				setFund,
				allocationSource,
				setAllocationSource,
				beneficiaryType,
				setBeneficiaryType,
			}}
		>
			<Container
				disableGutters={true}
				sx={{ pl: "12px", pr: "12px" }}
			>
				<Grid
					container
					spacing={2}
				>
					<Grid xs={12}>
						<YearSelector
							reportYear={reportYear}
							setReportYear={setReportYear}
						/>
					</Grid>
					<Grid xs={12}>
						<Selectors />
					</Grid>
				</Grid>
			</Container>
		</SelectionContext.Provider>
	);
}

export default MainContainer;
