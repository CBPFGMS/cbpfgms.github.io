import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import createTopChart from "../charts/createtopchart";
import Typography from "@mui/material/Typography";
import { Tooltip } from "react-tooltip";

function TopChart({ year, dataSummary, setYear, reportYear }: TopChartProps) {
	const height = 190;

	const chartPropertyArray: ChartValue[] = [
		"allocations",
		"projects",
		"partners",
	];

	const [chartValue, setChartValue] = useState<ChartValue>("allocations");

	const svgContainer = useRef(null);

	useEffect(() => {
		createTopChart({
			height,
			dataSummary,
			chartValue,
			svgContainer,
			year,
			setYear,
		});
	}, [dataSummary, chartValue]);

	function handleRadioChange(event: React.ChangeEvent<HTMLInputElement>) {
		setChartValue(event.target.value as ChartValue);
	}

	// function handleBarClick(event , d: SummaryData) {
	// };

	return (
		<Box
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Box style={{ marginRight: "1em" }}>
				<FormControl>
					<FormLabel
						id="topchart-buttons-group-label"
						style={{ marginBottom: "0.4em" }}
					>
						Show
					</FormLabel>
					<RadioGroup
						aria-labelledby="topchart-buttons-group-label"
						defaultValue={chartPropertyArray[0]}
						name="topchart-radio-buttons-group"
						onChange={handleRadioChange}
					>
						{chartPropertyArray.map((d, i) => (
							<FormControlLabel
								key={i}
								value={d}
								control={
									<Radio
										style={{
											paddingTop: "4px",
											paddingBottom: "4px",
										}}
										size="small"
									/>
								}
								label={
									<Typography variant="body2">
										{d.charAt(0).toUpperCase() + d.slice(1)}
									</Typography>
								}
							/>
						))}
					</RadioGroup>
				</FormControl>
			</Box>
			<Box
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Typography
					variant="body2"
					style={{ marginBottom: "0.5em" }}
				>
					Results reported in <strong>{reportYear[0]}</strong>
				</Typography>
				{dataSummary.map((d, i) => (
					<Tooltip
						key={i}
						id={`tooltip-topchart-${i}`}
					/>
				))}
				<svg
					ref={svgContainer}
					height={height}
				></svg>
			</Box>
		</Box>
	);
}

export default TopChart;
