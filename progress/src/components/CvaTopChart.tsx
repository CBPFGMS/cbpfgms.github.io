import React, { useState } from "react";
import { CvaChartModes, CvaChartTypes } from "./CvaChart";
import { DatumCva } from "../utils/processdatasummary";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import constants from "../utils/constants";
import colors from "../utils/colors";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { sum, format, scaleLinear } from "d3";
import NumberAnimator from "./NumberAnimator";
import formatSIFloat from "../utils/formatsi";
import { List } from "../utils/makelists";
import Snack from "./Snack";

type CvaTopChartProps = {
	dataCva: DatumCva[];
	cvaChartType: CvaChartTypes;
	cvaChartMode: CvaChartModes;
	setCvaChartType: React.Dispatch<React.SetStateAction<CvaChartTypes>>;
	lists: List;
};

type CvaTypeValues = {
	type: CvaChartTypes[number];
	value: number;
};

type TopChartRowProps = {
	label: string;
	value: number;
	color: string;
	width: number;
	clickValue: CvaChartTypes[number] | "all";
	cvaChartType: CvaChartTypes;
	setCvaChartType: React.Dispatch<React.SetStateAction<CvaChartTypes>>;
	cvaChartMode: CvaChartModes;
	totalValue: number;
};

const { cvaChartTypes, limitScaleValueInPixels, cvaTopChartColors } = constants;

function CvaTopChart({
	dataCva,
	cvaChartType,
	cvaChartMode,
	setCvaChartType,
	lists,
}: CvaTopChartProps) {
	const totalValue =
		cvaChartMode === "allocations"
			? sum(dataCva, d => d.targetedAllocations)
			: sum(dataCva, d => d.targetedPeople);

	const cvaTypeValuesWithZero: CvaTypeValues[] = cvaChartTypes.map(d => ({
		type: d,
		value: 0,
	}));

	const cvaTypeValues: CvaTypeValues[] = dataCva.reduce((acc, curr) => {
		const value =
			cvaChartMode === "allocations"
				? curr.targetedAllocations
				: curr.targetedPeople;
		const foundType = acc.find(d => d.type === curr.cvaType);
		if (foundType) {
			foundType.value += value;
		} else {
			acc.push({ type: curr.cvaType, value });
		}
		return acc;
	}, cvaTypeValuesWithZero);

	cvaTypeValues.sort((a, b) => b.value - a.value);

	const scale = scaleLinear<number, number, never>()
		.domain([0, totalValue])
		.range([0, 100]);

	return (
		<Box
			mt={5}
			display={"flex"}
			flexDirection={"column"}
			style={{ width: "96%" }}
		>
			<TopChartRow
				label={
					cvaChartMode === "allocations"
						? "Total CVA Allocations"
						: "Total CVA Beneficiaries"
				}
				value={totalValue}
				color={"#6E276B"}
				width={scale(totalValue)}
				clickValue="all"
				setCvaChartType={setCvaChartType}
				cvaChartType={cvaChartType}
				cvaChartMode={cvaChartMode}
				totalValue={totalValue}
			/>
			<Typography
				variant="caption"
				mt={1}
				mb={1}
				pl={"42px"}
			>
				Filter by CVA type:
			</Typography>
			{cvaTypeValues.map(d => (
				<TopChartRow
					key={d.type}
					label={lists.cvaTypeNames[d.type]}
					value={d.value}
					color={cvaTopChartColors[d.type]}
					width={scale(d.value)}
					clickValue={d.type}
					setCvaChartType={setCvaChartType}
					cvaChartType={cvaChartType}
					cvaChartMode={cvaChartMode}
					totalValue={totalValue}
				/>
			))}
		</Box>
	);
}

function TopChartRow({
	label,
	value,
	color,
	width,
	clickValue,
	cvaChartType,
	setCvaChartType,
	cvaChartMode,
	totalValue,
}: TopChartRowProps) {
	const [openSnack, setOpenSnack] = useState<boolean>(false);

	function handleChange(type: CvaChartTypes[number] | "all") {
		if (type === "all") {
			setCvaChartType([...cvaChartTypes]);
			return;
		}

		if (cvaChartType.includes(type)) {
			if (cvaChartType.length > 1) {
				setCvaChartType(cvaChartType.filter(d => d !== type));
			} else {
				setOpenSnack(true);
			}
			return;
		}

		setCvaChartType([...cvaChartType, type]);
	}

	return (
		<Box
			display={"flex"}
			flexDirection={"row"}
			style={{ width: "100%" }}
		>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one CVA type must be selected`}
			/>
			<Box
				display={"flex"}
				flexDirection={"row"}
				alignItems={"center"}
				justifyContent={"flex-start"}
				style={{ flex: "0 28%", paddingLeft: 10 }}
			>
				<FormControlLabel
					control={
						<Checkbox
							checked={
								clickValue === "all"
									? cvaChartType.length ===
									  cvaChartTypes.length
									: cvaChartType.includes(clickValue)
							}
							onChange={() => handleChange(clickValue)}
							sx={{
								color: colors.unColorLighter,
								padding: "5px",
								"&.Mui-checked": {
									color: color,
								},
							}}
						/>
					}
					label={
						<Typography
							variant="body2"
							fontWeight={500}
							fontSize={16}
							style={{
								color: "#444",
								lineHeight: "1.2",
								paddingLeft: "4px",
							}}
						>
							{label}
						</Typography>
					}
				/>
			</Box>
			<Box
				display={"flex"}
				flexDirection={"row"}
				alignItems={"center"}
				style={{
					flex: "0 72%",
					opacity:
						clickValue === "all" ||
						cvaChartType.includes(clickValue)
							? 1
							: 0.5,
				}}
			>
				<Box
					style={{
						display: "flex",
						flexDirection: "row",
						width: "100%",
						alignItems: "center",
					}}
					data-tooltip-id="tooltip"
					data-tooltip-content={
						(cvaChartMode === "allocations" ? "$" : "") +
						format(",.0f")(value)
					}
					data-tooltip-place="top"
				>
					<Box
						style={{
							marginTop: "2px",
							marginBottom: "2px",
							display: "flex",
							alignItems: "center",
							width: "100%",
						}}
					>
						<Box
							style={{
								width: width + "%",
								minWidth: "1px",
								height: "18px",
								transitionProperty: "width",
								transitionDuration: "0.75s",
								display: "flex",
								alignItems: "center",
								backgroundColor: color,
							}}
						>
							<Typography
								fontSize={12}
								fontWeight={700}
								style={{
									position: "relative",
									left:
										width < limitScaleValueInPixels
											? "3px"
											: "-3px",
									marginLeft:
										width < limitScaleValueInPixels
											? "100%"
											: "auto",
									color:
										width < limitScaleValueInPixels
											? "#444"
											: "#fff",
								}}
							>
								{cvaChartMode === "allocations" ? "$" : ""}
								<NumberAnimator
									number={parseFloat(formatSIFloat(value))}
									type="decimal"
								/>
								{isNaN(+formatSIFloat(value).slice(-1))
									? formatSIFloat(value).slice(-1)
									: ""}
								{clickValue === "all" ? (
									""
								) : (
									<span
										style={{
											fontSize: "11px",
											fontWeight: "normal",
										}}
									>
										{`\u00A0(${format(".1%")(
											value / totalValue
										)})`}
									</span>
								)}
							</Typography>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

const MemoisedCvaTopChart = React.memo(CvaTopChart);

export default MemoisedCvaTopChart;
