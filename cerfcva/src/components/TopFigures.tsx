import React from "react";
import Box from "@mui/material/Box";
import { type DataTopFigures } from "../utils/processdatasummary";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import { MoneyBagIcon, CashIcon } from "../assets/OchaIcons";
import colors from "../utils/colors";
import NumberAnimator from "./NumberAnimator";
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
						</Box>
						<RrAndUfe
							rr={dataTopFigures.rrTotal}
							ufe={dataTopFigures.ufeTotal}
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
						<RrAndUfe
							rr={dataTopFigures.rr}
							ufe={dataTopFigures.ufe}
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
									totalSlice={dataTopFigures.totalAllocations}
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
							}}
							data-tooltip-id="tooltip"
							data-tooltip-html={`RR percentage: $${format(".1%")(
								dataTopFigures.rrTotal === 0
									? 0
									: dataTopFigures.rr / dataTopFigures.rrTotal
							)}<br />UFE percentage: $${format(".1%")(
								dataTopFigures.ufeTotal === 0
									? 0
									: dataTopFigures.ufe /
											dataTopFigures.ufeTotal
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
									CVA RR as % of total RR:
								</Typography>
								<Typography
									variant="body2"
									fontWeight={500}
									fontSize={18}
									style={{
										color: colors.rrColorDarker,
										border: "none",
									}}
								>
									<NumberAnimator
										number={
											dataTopFigures.rrTotal === 0
												? 0
												: Math.round(
														(dataTopFigures.rr *
															100) /
															dataTopFigures.rrTotal
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
									CVA UFE as % of total UFE:
								</Typography>
								<Typography
									variant="body2"
									fontWeight={500}
									fontSize={18}
									style={{
										color: colors.ufeColorDarker,
										border: "none",
									}}
								>
									<NumberAnimator
										number={
											dataTopFigures.ufeTotal === 0
												? 0
												: Math.round(
														(dataTopFigures.ufe *
															100) /
															dataTopFigures.ufeTotal
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
			</Typography>
		</Box>
	);
}

function RrAndUfe({
	rr,
	ufe,
	total,
}: {
	rr: number;
	ufe: number;
	total: number;
}) {
	return (
		<Box
			data-tooltip-id="tooltip"
			data-tooltip-html={`<div style='display:table;width:100%;border-spacing:2px 0;'><div style='display:table-row;'><div style='display:table-cell;padding-right:12px;text-align:right;'>Rapid Response (${format(
				".1%"
			)(
				rr + ufe === 0 ? 0 : rr / (rr + ufe)
			)}):</div><div style='display:table-cell;text-align:right;'>$${format(
				",.2f"
			)(
				rr
			)}</div></div><div style='display:table-row;'><div style='display:table-cell;padding-right:12px;text-align:right;'>Underfunded Emergencies: (${format(
				".1%"
			)(
				rr + ufe === 0 ? 0 : ufe / (rr + ufe)
			)}):</div><div style='display:table-cell;text-align:right;'>$${format(
				",.2f"
			)(ufe)}</div></div></div>`}
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
					Rapid
					<br />
					Response (
					<NumberAnimator
						number={
							total === 0 ? 0 : Math.round((rr * 100) / total)
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
						color: colors.rrColorDarker,
						border: "none",
					}}
				>
					<SiValue
						number={rr}
						type="decimal"
					/>
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
					totalSlice={rr}
					CvaSlice={ufe}
					totalColor={colors.rrColor}
					CvaColor={colors.ufeColor}
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
					Underfunded
					<br />
					emergencies (
					<NumberAnimator
						number={
							total === 0 ? 0 : Math.round((ufe * 100) / total)
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
						color: colors.ufeColorDarker,
						border: "none",
					}}
				>
					<SiValue
						number={ufe}
						type="decimal"
					/>
				</Typography>
			</Box>
		</Box>
	);
}

const MemoizedTopFigures = React.memo(TopFigures);

export default MemoizedTopFigures;
