import React from "react";
import Box from "@mui/material/Box";
import { type DataTopFigures } from "../utils/processdatasummary";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import { MoneyBagIcon, CashIcon } from "../assets/OchaIcons";
import colors from "../utils/colors";
import NumberAnimator from "./NumberAnimator";
import formatSIFloat from "../utils/formatsi";
import Typography from "@mui/material/Typography";
import Donut from "./Donut";
import SiValue from "./SiValue";
import { format } from "d3";

type TopFiguresProps = {
	dataTopFigures: DataTopFigures;
};

export type DonutDatum = {
	value: number;
	type: "total" | "cva";
};

function TopFigures({ dataTopFigures }: TopFiguresProps) {
	const rrPercentage = dataTopFigures.rr
		? (dataTopFigures.rr / dataTopFigures.allocations) * 100
		: 0;
	const ufePercentage = dataTopFigures.ufe
		? (dataTopFigures.ufe / dataTopFigures.allocations) * 100
		: 0;

	return (
		<Box
			mt={3}
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
				width={"92%"}
				flexWrap={"nowrap"}
				justifyContent={"center"}
				alignItems={"center"}
				height={"88px"}
				mb={3}
			>
				<Grid
					size={4}
					height={"100%"}
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
								variant="h3"
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
					size={4}
					height={"100%"}
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
								variant="h3"
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
					size={4}
					height={"100%"}
				>
					<Box
						data-tooltip-id="tooltip"
						data-tooltip-content={`CVA percentage: $${format(".1%")(
							dataTopFigures.allocations /
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
								flex: "0 50%",
								alignItems: "center",
								justifyContent: "center",
								textAlign: "center",
								paddingLeft: "2em",
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
								flex: "0 50%",
								alignItems: "center",
								justifyContent: "center",
								width: "100%",
								height: "100%",
							}}
						>
							<Donut
								totalSlice={dataTopFigures.totalAllocations}
								CvaSlice={dataTopFigures.allocations}
								totalColor={colors.totalAllocationsSliceColor}
								CvaColor={colors.unColor}
							/>
						</Box>
					</Box>
				</Grid>
			</Grid>
			<Box
				display={"flex"}
				flexDirection={"row"}
				width={"92%"}
				justifyContent={"center"}
				alignItems={"center"}
			>
				<ProjectsAndPartners
					value={dataTopFigures.projects.size}
					text={"CVA projects"}
				/>
				<Box>
					<Typography
						style={{
							color: colors.topFiguresColor,
						}}
					>
						&#x2B25;
					</Typography>
				</Box>
				<ProjectsAndPartners
					value={dataTopFigures.partners.size}
					text={"CVA partners"}
				/>
				<Box>
					<Typography
						style={{
							color: colors.topFiguresColor,
						}}
					>
						&#x2B25;
					</Typography>
				</Box>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						paddingLeft: "1em",
						flexGrow: 0,
					}}
				>
					<RrAndUfe
						text={"Rapid Response"}
						value={dataTopFigures.rr}
						percentage={rrPercentage}
						color={colors.rrColorDarker}
					/>
					<RrAndUfe
						text={"Underfunded Emergencies"}
						value={dataTopFigures.ufe}
						percentage={ufePercentage}
						color={colors.ufeColorDarker}
						last
					/>
				</Box>
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
				fontSize={24}
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
				fontSize={18}
				style={{
					color: "#666",
					marginLeft: "0.5em",
				}}
				noWrap
			>
				{text}
			</Typography>
		</Box>
	);
}

function RrAndUfe({
	text,
	value,
	percentage,
	color,
	last,
}: {
	text: string;
	value: number;
	percentage: number;
	color: string;
	last?: boolean;
}) {
	return (
		<Box
			data-tooltip-id="tooltip"
			data-tooltip-content={`${text} total: $${format(",.2f")(value)}`}
			data-tooltip-place="top"
			sx={{
				display: "flex",
				flexDirection: "row",
				alignItems: "baseline",
				justifyContent: "flex-start",
				width: "100%",
				marginTop: last ? "-0.5em" : 0,
			}}
		>
			<Typography
				fontSize={18}
				style={{
					color: "#666",
				}}
			>
				{text}:
			</Typography>
			<Typography
				variant="h6"
				fontWeight={500}
				fontSize={22}
				style={{
					color: color,
					marginLeft: "0.5em",
				}}
			>
				<SiValue
					number={value}
					type="decimal"
				/>
			</Typography>
			<Typography
				fontWeight={400}
				fontSize={18}
				style={{
					color: "#666",
					marginLeft: "0.5em",
				}}
			>
				{"("}
				<NumberAnimator
					number={parseFloat(formatSIFloat(percentage))}
					type="integer"
				/>
				{"%)"}
			</Typography>
		</Box>
	);
}

const MemoizedTopFigures = React.memo(TopFigures);

export default MemoizedTopFigures;
