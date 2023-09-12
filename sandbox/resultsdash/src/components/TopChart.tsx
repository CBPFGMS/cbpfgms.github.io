import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import createTopChart from "../charts/createtopchart";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { Tooltip } from "react-tooltip";
import colors from "../utils/colors";
import MiniChart from "../assets/MiniChart";

function TopChart({ year, dataSummary, setYear, reportYear }: TopChartProps) {
	const [barClicked, setBarClicked] = useState<boolean>(false);

	useEffect(() => {
		if (year !== null) {
			localStorage.setItem("barClicked", "true");
		}
		const clicked = JSON.parse(
			localStorage.getItem("barClicked") || "false"
		);
		setBarClicked(clicked);
		// if (year !== null) setBarClicked(true);
	}, [year]);

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
			gap={2}
		>
			<Paper
				elevation={1}
				style={{
					padding: "12px",
					backgroundColor: "#ffffff",
				}}
			>
				<Box style={{ marginRight: "2em", marginLeft: "1em" }}>
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
											disabled={dataSummary.length === 0}
											style={{
												paddingTop: "4px",
												paddingBottom: "4px",
											}}
											size="small"
										/>
									}
									label={
										<Typography variant="body2">
											{d.charAt(0).toUpperCase() +
												d.slice(1)}
										</Typography>
									}
								/>
							))}
						</RadioGroup>
					</FormControl>
				</Box>
			</Paper>
			<Paper
				elevation={1}
				style={{
					padding: "12px",
					backgroundColor: "#ffffff",
				}}
			>
				<Box
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Typography
						variant="body2"
						style={{ marginBottom: "0.5em", textAlign: "center" }}
					>
						Report dashboard of{" "}
						<strong style={{ color: colors.contrastColorDarker }}>
							{reportYear[0]}
						</strong>{" "}
						contains data
						<br />
						from the following allocation year
						{dataSummary.length > 1 ? "s" : ""}:
					</Typography>
					{dataSummary.map((_, i) => (
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
			</Paper>
			{!barClicked && (
				<Box
					style={{
						width: "260px",
						borderBottom: "1px solid " + colors.contrastColor,
						paddingLeft: "0.5em",
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
					}}
				>
					<MiniChart style={{ fontSize: "4em" }} />
					<Typography
						variant="body2"
						style={{
							marginBottom: "0.5em",
							textAlign: "center",
							marginLeft: "1em",
						}}
					>
						Click on Allocation YEAR bar to filter{" "}
						<span style={{ textDecoration: "underline" }}>
							projects
						</span>{" "}
						contributing for the selected year results
					</Typography>
				</Box>
			)}
		</Box>
	);
}

export default TopChart;
