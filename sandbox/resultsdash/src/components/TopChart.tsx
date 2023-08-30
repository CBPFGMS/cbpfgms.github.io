import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import createTopChart from "../charts/createtopchart";
import Typography from "@mui/material/Typography";

function TopChart({ year, dataSummary, setYear }: TopChartProps) {
	const height = 190,
		padding = [4, 4, 20, 4],
		minStep = 40,
		width = padding[1] + padding[3] + dataSummary.length * minStep;

	const chartPropertyArray: ChartValue[] = [
		"allocations",
		"projects",
		"partners",
	];

	const [chartValue, setChartValue] = useState<ChartValue>("allocations");

	const svgContainer = useRef(null);

	useEffect(() => {
		createTopChart();
	}, [dataSummary, chartValue]);

	function handleRadioChange(event: React.ChangeEvent<HTMLInputElement>) {
		setChartValue(event.target.value as ChartValue);
	}

	return (
		<Box
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Box>
				<FormControl>
					<FormLabel id="topchart-buttons-group-label">
						Show
					</FormLabel>
					<RadioGroup
						aria-labelledby="topchart-buttons-group-label"
						defaultValue={chartValue}
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
			<Box>
				<svg
					ref={svgContainer}
					width={width}
					height={height}
				></svg>
			</Box>
		</Box>
	);
}

export default TopChart;
