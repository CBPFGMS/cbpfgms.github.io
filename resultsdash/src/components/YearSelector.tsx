import { useContext } from "react";
import Box from "@mui/material/Box";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import DataContext from "../context/DataContext";
import { DataContextType, YearSelectorProps } from "../types";

function YearSelector({
	reportYear,
	setReportYear,
	reportYears,
	setYear,
	setFund,
	setAllocationSource,
	setAllocationType,
}: YearSelectorProps) {
	const apiData = useContext(DataContext) as DataContextType;

	function handleLeftClick() {
		setYear(null);
		setReportYear(prev =>
			reportYears.has(prev[0] - 1) ? [prev[0] - 1] : prev
		);
		resetFilters();
	}

	function handleRightClick() {
		setYear(null);
		setReportYear(prev =>
			reportYears.has(prev[0] + 1) ? [prev[0] + 1] : prev
		);
		resetFilters();
	}

	function resetFilters() {
		setAllocationType([...apiData.inDataLists.allocationTypes]);
		setFund([...apiData.inDataLists.funds]);
		setAllocationSource([...apiData.inDataLists.allocationSources]);
	}

	const handleChange = (event: SelectChangeEvent) => {
		setYear(null);
		setReportYear([+event.target.value]);
		resetFilters();
	};

	return (
		<Box
			display={"flex"}
			alignItems={"center"}
			justifyContent={"center"}
			gap={2}
		>
			<ArrowCircleLeftOutlinedIcon
				fontSize="large"
				style={{ cursor: "pointer" }}
				onClick={handleLeftClick}
				color={
					reportYears.has(reportYear[0] - 1) ? "primary" : "disabled"
				}
			/>
			<FormControl size="small">
				<InputLabel id="report-year-label">Report Year</InputLabel>
				<Select
					labelId="report-year-label"
					id="report-year-select"
					value={reportYear[0].toString()}
					label="Report Year"
					sx={{ fontSize: "24px", fontWeight: "700" }}
					onChange={handleChange}
				>
					{[...reportYears]
						.sort((a, b) => b - a)
						.map(year => (
							<MenuItem
								key={year}
								value={year}
							>
								{year}
							</MenuItem>
						))}
				</Select>
			</FormControl>
			<ArrowCircleRightOutlinedIcon
				fontSize="large"
				style={{ cursor: "pointer" }}
				onClick={handleRightClick}
				color={
					reportYears.has(reportYear[0] + 1) ? "primary" : "disabled"
				}
			/>
		</Box>
	);
}

export default YearSelector;
