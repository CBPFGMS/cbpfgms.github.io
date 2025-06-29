import React from "react";
import Box from "@mui/material/Box";
import { type DataTopFigures } from "../utils/processdata";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import { MoneyBagIcon, CashIcon } from "../assets/OchaIcons";
import colors from "../utils/colors";
import NumberAnimator from "./NumberAnimator";
import Typography from "@mui/material/Typography";
import Donut from "./Donut";
import SiValue from "./SiValue";
import { format } from "d3";
import constants from "../utils/constants";
import InfoIcon from "@mui/icons-material/Info";
import formatSIFloat from "../utils/formatsi";

type TopFiguresProps = {
	dataTopFigures: DataTopFigures;
	year: number[];
};

export type DonutDatum = {
	value: number;
	type: "total" | "cva";
};

const { firstYearOfCvaData } = constants;

function TopFigures({ dataTopFigures, year }: TopFiguresProps) {
	return (
		<Box
			pt={3}
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				width: "100%",
				mb: 2,
			}}
		>
			<Grid
				container
				spacing={2}
				width={"95%"}
				flexWrap={"nowrap"}
				justifyContent={"center"}
				alignItems={"center"}
				height={"168px"}
				mb={5}
			>
				<Grid
					size={4.5}
					height={"100%"}
				>
					<Box
						style={{
							height: "100%",
							width: "100%",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							gap: "2em",
						}}
					>
						<Box
							data-tooltip-id="tooltip"
							data-tooltip-content={`Total allocations: $${format(
								",.2f"
							)(dataTopFigures.totalAllocations)}`}
							data-tooltip-place="top"
							sx={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "center",
								height: "100%",
							}}
						>
							<MoneyBagIcon
								svgProps={{
									style: {
										marginRight: "0.5em",
										width: "74px",
										height: "74px",
										fill: colors.unColor,
									},
								}}
							/>
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Typography
									variant="h2"
									fontWeight={500}
									style={{
										color: colors.topFiguresColor,
										border: "none",
									}}
								>
									<SiValue
										number={dataTopFigures.totalAllocations}
										type="decimal"
									/>
								</Typography>
								<Typography
									style={{
										marginTop: "-0.5em",
										fontSize: 18,
										color: "#666",
										fontFamily: "Roboto, sans-serif",
										fontWeight: "normal",
									}}
								>
									Total Allocations
								</Typography>
							</Box>
							{year.length === 1 &&
								year[0] === firstYearOfCvaData && (
									<InfoIcon
										data-tooltip-id="tooltip"
										data-tooltip-content={
											"Data starting from the launch of the online grant management system OneGMS on 1 June 2024. Prior data is not represented but is available in CBPF’s annual reports."
										}
										data-tooltip-place="top"
										style={{
											color: colors.unColor,
											fontSize: "22px",
											marginLeft: "0.1em",
											alignSelf: "flex-start",
										}}
									/>
								)}
						</Box>
						<StandardAndReserve
							standard={dataTopFigures.standardTotal}
							reserve={dataTopFigures.reserveTotal}
							total={dataTopFigures.totalAllocations}
						/>
					</Box>
				</Grid>
				<Divider
					orientation="vertical"
					flexItem
					style={{
						borderLeft: "3px dotted #ccc",
						borderRight: "none",
					}}
				/>
				<Grid
					size={4.5}
					height={"100%"}
				>
					<Box
						style={{
							height: "100%",
							width: "100%",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							gap: "2em",
						}}
					>
						<Box
							data-tooltip-id="tooltip"
							data-tooltip-content={`Total CVA allocations: $${format(
								",.2f"
							)(dataTopFigures.allocations)}`}
							data-tooltip-place="top"
							sx={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "center",
								height: "100%",
							}}
						>
							<CashIcon
								svgProps={{
									style: {
										marginRight: "1em",
										width: "62px",
										height: "62px",
										fill: colors.unColor,
									},
								}}
							/>
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Typography
									variant="h2"
									fontWeight={500}
									style={{
										color: colors.topFiguresColor,
										border: "none",
									}}
								>
									<SiValue
										number={dataTopFigures.allocations}
										type="decimal"
									/>
								</Typography>
								<Typography
									style={{
										marginTop: "-0.5em",
										fontSize: 18,
										color: "#666",
										fontFamily: "Roboto, sans-serif",
										fontWeight: "normal",
									}}
								>
									CVA Allocations
								</Typography>
							</Box>
						</Box>
						<StandardAndReserve
							standard={dataTopFigures.standard}
							reserve={dataTopFigures.reserve}
							total={dataTopFigures.allocations}
						/>
					</Box>
				</Grid>
				<Divider
					orientation="vertical"
					flexItem
					style={{
						borderLeft: "3px dotted #ccc",
						borderRight: "none",
					}}
				/>
				<Grid
					size={3}
					height={"100%"}
				>
					<Box
						style={{
							height: "100%",
							width: "100%",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Box
							data-tooltip-id="tooltip"
							data-tooltip-content={`CVA percentage: $${format(
								".1%"
							)(
								dataTopFigures.totalAllocations === 0
									? 0
									: dataTopFigures.allocations /
											dataTopFigures.totalAllocations
							)}`}
							data-tooltip-place="top"
							sx={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "center",
								height: "100%",
							}}
						>
							<Box
								style={{
									display: "flex",
									flex: "0 60%",
									alignItems: "center",
									justifyContent: "center",
									textAlign: "center",
									paddingLeft: "1em",
									paddingRight: "1em",
								}}
							>
								<Typography
									variant="body2"
									fontWeight={400}
									fontSize={15}
									style={{
										color: colors.topFiguresColor,
										border: "none",
									}}
								>
									CVA Allocations as percentage of total
									allocations
								</Typography>
							</Box>
							<Box
								style={{
									display: "flex",
									flex: "0 40%",
									alignItems: "center",
									justifyContent: "center",
									width: "100%",
									height: "100%",
								}}
							>
								<Donut
									totalSlice={
										dataTopFigures.totalAllocations -
										dataTopFigures.allocations
									}
									CvaSlice={dataTopFigures.allocations}
									totalColor={
										colors.totalAllocationsSliceColor
									}
									CvaColor={colors.unColor}
								/>
							</Box>
						</Box>
						<Box
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								gap: "0.5em",
							}}
							data-tooltip-id="tooltip"
							data-tooltip-html={`Standard percentage: $${format(
								".1%"
							)(
								dataTopFigures.standardTotal === 0
									? 0
									: dataTopFigures.standard /
											dataTopFigures.standardTotal
							)}<br />Reserve percentage: $${format(".1%")(
								dataTopFigures.reserveTotal === 0
									? 0
									: dataTopFigures.reserve /
											dataTopFigures.reserveTotal
							)}`}
							data-tooltip-place="top"
						>
							<Box
								style={{
									display: "flex",
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "center",
								}}
								mt={2}
							>
								<Typography
									variant="body2"
									fontWeight={400}
									fontSize={14}
									lineHeight={1.2}
									style={{
										color: colors.topFiguresColor,
										border: "none",
										paddingRight: "0.5em",
									}}
								>
									Standard CVA as % of total standard
									allocations:
								</Typography>
								<Typography
									variant="body2"
									fontWeight={500}
									fontSize={18}
									style={{
										color: colors.standardColorDarker,
										border: "none",
									}}
								>
									<NumberAnimator
										number={
											dataTopFigures.standardTotal === 0
												? 0
												: Math.round(
														(dataTopFigures.standard *
															100) /
															dataTopFigures.standardTotal
												  )
										}
										type="integer"
									/>
									%
								</Typography>
							</Box>
							<Box
								style={{
									display: "flex",
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Typography
									variant="body2"
									fontWeight={400}
									fontSize={14}
									lineHeight={1.2}
									style={{
										color: colors.topFiguresColor,
										border: "none",
										paddingRight: "0.5em",
									}}
								>
									Reserve CVA as % of total reserve
									allocations:
								</Typography>
								<Typography
									variant="body2"
									fontWeight={500}
									fontSize={18}
									style={{
										color: colors.reserveColorDarker,
										border: "none",
									}}
								>
									<NumberAnimator
										number={
											dataTopFigures.reserveTotal === 0
												? 0
												: Math.round(
														(dataTopFigures.reserve *
															100) /
															dataTopFigures.reserveTotal
												  )
										}
										type="integer"
									/>
									%
								</Typography>
							</Box>
						</Box>
					</Box>
				</Grid>
			</Grid>
			<Box
				display={"flex"}
				flexDirection={"row"}
				width={"90%"}
				justifyContent={"center"}
				alignItems={"center"}
			>
				<ProjectsAndPartners
					value={dataTopFigures.projects.size}
					text={"CVA project"}
				/>
				<Box>
					<Typography
						style={{
							color: colors.topFiguresColor,
						}}
					>
						{"\u2B25"}
					</Typography>
				</Box>
				<ProjectsAndPartners
					value={dataTopFigures.partners.size}
					text={"CVA partner"}
				/>
			</Box>
		</Box>
	);
}

function ProjectsAndPartners({ value, text }: { value: number; text: string }) {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "row",
				alignItems: "baseline",
				justifyContent: "center",
				paddingRight: "1em",
				paddingLeft: "1em",
				flexGrow: 0,
			}}
		>
			<Typography
				fontWeight={500}
				fontSize={28}
				style={{
					color: colors.topFiguresColor,
				}}
			>
				<NumberAnimator
					number={value}
					type="integer"
				/>
			</Typography>
			<Typography
				fontWeight={400}
				fontSize={22}
				style={{
					color: "#666",
					marginLeft: "0.5em",
				}}
				noWrap
			>
				{text}
				{value > 1 ? "s" : ""}
			</Typography>
		</Box>
	);
}

function StandardAndReserve({
	standard,
	reserve,
	total,
}: {
	standard: number;
	reserve: number;
	total: number;
}) {
	return (
		<Box
			data-tooltip-id="tooltip"
			data-tooltip-html={`<div style='display:table;width:100%;border-spacing:2px 0;'><div style='display:table-row;'><div style='display:table-cell;padding-right:12px;text-align:right;'>Standard (${format(
				".1%"
			)(
				standard + reserve === 0 ? 0 : standard / (standard + reserve)
			)}):</div><div style='display:table-cell;text-align:right;'>$${format(
				",.2f"
			)(
				standard
			)}</div></div><div style='display:table-row;'><div style='display:table-cell;padding-right:12px;text-align:right;'>Reserve: (${format(
				".1%"
			)(
				standard + reserve === 0 ? 0 : reserve / (standard + reserve)
			)}):</div><div style='display:table-cell;text-align:right;'>$${format(
				",.2f"
			)(reserve)}</div></div></div>`}
			data-tooltip-place="top"
			sx={{
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "flex-start",
				width: "96%",
			}}
		>
			<Box
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
					flex: "0 41%",
				}}
			>
				<Typography
					variant="body2"
					fontWeight={400}
					fontSize={14}
					lineHeight={1.2}
					style={{
						color: colors.topFiguresColor,
						border: "none",
					}}
				>
					Standard (
					<NumberAnimator
						number={
							total === 0
								? 0
								: Math.round((standard * 100) / total)
						}
						type="integer"
					/>
					%):
				</Typography>
				<Typography
					variant="body2"
					fontWeight={500}
					fontSize={18}
					style={{
						color: colors.standardColorDarker,
						border: "none",
					}}
				>
					{standard < 1e3 ? (
						<NumberAnimator
							number={standard}
							type="decimal"
						/>
					) : (
						<span>
							<NumberAnimator
								number={
									adjustValues(standard, reserve, total)
										.standard
								}
								type="decimal"
							/>
							{formatSIFloat(standard).slice(-1)}
						</span>
					)}
				</Typography>
			</Box>
			<Box
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: "100%",
					height: "100%",
					flex: "0 18%",
				}}
			>
				<Donut
					totalSlice={standard}
					CvaSlice={reserve}
					totalColor={colors.standardColor}
					CvaColor={colors.reserveColor}
					showTotal={false}
				/>
			</Box>
			<Box
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
					flex: "0 41%",
				}}
			>
				<Typography
					variant="body2"
					fontWeight={400}
					fontSize={14}
					lineHeight={1.2}
					style={{
						color: colors.topFiguresColor,
						border: "none",
					}}
				>
					Reserve (
					<NumberAnimator
						number={
							total === 0
								? 0
								: Math.round((reserve * 100) / total)
						}
						type="integer"
					/>
					%):
				</Typography>
				<Typography
					variant="body2"
					fontWeight={500}
					fontSize={18}
					style={{
						color: colors.reserveColorDarker,
						border: "none",
					}}
				>
					{reserve < 1e3 ? (
						<NumberAnimator
							number={reserve}
							type="decimal"
						/>
					) : (
						<span>
							<NumberAnimator
								number={
									adjustValues(standard, reserve, total)
										.reserve
								}
								type="decimal"
							/>
							{formatSIFloat(reserve).slice(-1)}
						</span>
					)}
				</Typography>
			</Box>
		</Box>
	);
}

function adjustValues(
	standard: number,
	reserve: number,
	total: number
): { standard: number; reserve: number } {
	if (total < 1e3) {
		return { standard: standard, reserve: reserve };
	}

	const formattedStandard = formatSIFloat(standard),
		formattedReserve = formatSIFloat(reserve),
		formattedTotal = formatSIFloat(total);

	const standardUnit = extractUnit(formattedStandard),
		reserveUnit = extractUnit(formattedReserve),
		totalUnit = extractUnit(formattedTotal);

	let standardFormattedValue = parseFloat(formattedStandard),
		reserveFormattedValue = parseFloat(formattedReserve);

	const totalFormattedValue = parseFloat(formattedTotal);

	if (
		standardUnit === reserveUnit &&
		reserveUnit === totalUnit &&
		standardFormattedValue + reserveFormattedValue !== totalFormattedValue
	) {
		const difference = Number(
			Math.abs(
				standardFormattedValue +
					reserveFormattedValue -
					totalFormattedValue
			).toFixed(3)
		);
		if (
			standardFormattedValue + reserveFormattedValue >
			totalFormattedValue
		) {
			if (standardFormattedValue < reserveFormattedValue) {
				standardFormattedValue -= difference;
			} else {
				reserveFormattedValue -= difference;
			}
		} else {
			if (standardFormattedValue < reserveFormattedValue) {
				standardFormattedValue += difference;
			} else {
				reserveFormattedValue += difference;
			}
		}
	}

	return {
		standard: Number(standardFormattedValue.toFixed(3)),
		reserve: Number(reserveFormattedValue.toFixed(3)),
	};
}

function extractUnit(s: string): string | null {
	const match = s.match(/([a-zA-Z])$/);
	return match ? match[1] : null;
}

const MemoizedTopFigures = React.memo(TopFigures);

export default MemoizedTopFigures;
