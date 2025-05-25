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
								{dataTopFigures.totalAllocations < 1e3 ? (
									<NumberAnimator
										number={dataTopFigures.totalAllocations}
										type="decimal"
									/>
								) : (
									<span>
										<NumberAnimator
											number={parseFloat(
												formatSIFloat(
													dataTopFigures.totalAllocations
												)
											)}
											type="decimal"
										/>
										{formatSIFloat(
											dataTopFigures.totalAllocations
										).slice(-1)}
									</span>
								)}
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
								{dataTopFigures.allocations < 1e3 ? (
									<NumberAnimator
										number={dataTopFigures.allocations}
										type="decimal"
									/>
								) : (
									<span>
										<NumberAnimator
											number={parseFloat(
												formatSIFloat(
													dataTopFigures.allocations
												)
											)}
											type="decimal"
										/>
										{formatSIFloat(
											dataTopFigures.allocations
										).slice(-1)}
									</span>
								)}
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
							number={dataTopFigures.projects.size}
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
						CVA Projects
					</Typography>
				</Box>
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
							number={dataTopFigures.partners.size}
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
						CVA Partners
					</Typography>
				</Box>
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
					<Box
						sx={{
							display: "flex",
							flexDirection: "row",
							alignItems: "baseline",
							justifyContent: "flex-start",
							width: "100%",
						}}
					>
						<Typography
							fontSize={18}
							style={{
								color: "#666",
							}}
						>
							Rapid Response:
						</Typography>
						<Typography
							variant="h6"
							fontWeight={500}
							fontSize={22}
							style={{
								color: colors.rrColorDarker,
								marginLeft: "0.5em",
							}}
						>
							{dataTopFigures.rr < 1e3 ? (
								<NumberAnimator
									number={dataTopFigures.rr}
									type="decimal"
								/>
							) : (
								<span>
									<NumberAnimator
										number={parseFloat(
											formatSIFloat(dataTopFigures.rr)
										)}
										type="decimal"
									/>
									{formatSIFloat(dataTopFigures.rr).slice(-1)}
								</span>
							)}
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
								number={parseFloat(formatSIFloat(rrPercentage))}
								type="integer"
							/>
							{"%)"}
						</Typography>
					</Box>
					<Box
						sx={{
							display: "flex",
							flexDirection: "row",
							alignItems: "baseline",
							justifyContent: "flex-start",
							width: "100%",
							marginTop: "-0.5em",
						}}
					>
						<Typography
							fontSize={18}
							style={{
								color: "#666",
							}}
						>
							Underfunded Emergencies:
						</Typography>
						<Typography
							variant="h6"
							fontWeight={500}
							fontSize={22}
							style={{
								color: colors.ufeColorDarker,
								marginLeft: "0.5em",
							}}
						>
							{dataTopFigures.ufe < 1e3 ? (
								<NumberAnimator
									number={dataTopFigures.ufe}
									type="decimal"
								/>
							) : (
								<span>
									<NumberAnimator
										number={parseFloat(
											formatSIFloat(dataTopFigures.ufe)
										)}
										type="decimal"
									/>
									{formatSIFloat(dataTopFigures.ufe).slice(
										-1
									)}
								</span>
							)}
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
								number={parseFloat(
									formatSIFloat(ufePercentage)
								)}
								type="integer"
							/>
							{"%)"}
						</Typography>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

const MemoizedTopFigures = React.memo(TopFigures);

export default MemoizedTopFigures;
