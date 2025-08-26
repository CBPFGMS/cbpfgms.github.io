import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import { scaleLinear, format } from "d3";
import { type ListObj } from "../utils/makelists";
import { type Charts } from "./MainContainer";
import { clustersIconsData } from "../assets/clustericons";
import constants from "../utils/constants";

export type BarChartRowProps = {
	typeId: number;
	valueA: number;
	valueB: number;
	colorA: string;
	colorB: string;
	maxValue: number;
	listProperty: ListObj;
	chartType: Charts;
	fromCva?: boolean;
	totalCvaPercentage?: number | boolean;
	fromFunds?: boolean;
	cvaPercentage?: number;
};

const { limitScaleValueInPixels } = constants;

function BarChartRow({
	typeId,
	valueA,
	valueB,
	colorA,
	colorB,
	listProperty,
	maxValue,
	chartType,
	fromCva = false,
	totalCvaPercentage = false,
	fromFunds = false,
	cvaPercentage = 0,
}: BarChartRowProps) {
	const scale = scaleLinear<number>().domain([0, maxValue]).range([0, 100]);

	const calcAmount =
		fromCva && typeof totalCvaPercentage === "number" ? "8%" : "0%";

	return (
		<Box
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				width: "100%",
			}}
		>
			<Box
				style={{
					flex: chartType === "sectors" ? "0 32% " : "0 22% ",
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-end",
					textAlign: "right",
					overflow: "hidden",
				}}
			>
				<Typography
					variant="body2"
					fontWeight={400}
					fontSize={13}
					style={{ color: "#444", border: "none" }}
				>
					{listProperty[typeId]}
				</Typography>
				{chartType === "sectors" && (
					<img
						src={clustersIconsData[typeId]}
						style={{
							width: "24px",
							height: "24px",
							marginLeft: "8px",
							marginRight: "0px",
							padding: "4px",
						}}
					/>
				)}
			</Box>
			{fromCva && typeof totalCvaPercentage === "number" && (
				<Box
					style={{
						flex: `0 ${calcAmount}`,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						paddingLeft: "6px",
					}}
				>
					<Typography
						variant="body2"
						style={{
							fontSize: 13,
							color: "#444",
							border: "none",
							fontStyle: "normal",
							fontWeight: 600,
						}}
					>
						{"("}
						{totalCvaPercentage > 0 && totalCvaPercentage < 1 ? (
							"<1"
						) : (
							<NumberAnimator
								number={totalCvaPercentage}
								numberType="integer"
							/>
						)}
						{"%)"}
					</Typography>
				</Box>
			)}
			<Box
				style={{
					flex:
						chartType === "sectors"
							? `0 calc(68% - ${calcAmount})`
							: chartType === "cvaTypes"
							? `0 calc(78% - ${calcAmount})`
							: `0 calc(66% - ${calcAmount})`,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				{[valueA, valueB].map((d, i) => (
					<Box
						style={{
							display: "flex",
							flexDirection: "row",
							width: "100%",
							alignItems: "center",
						}}
						key={i}
						data-tooltip-id={"tooltip"}
						data-tooltip-content={`${
							fromFunds
								? i
									? "CVA allocations"
									: "Total allocations"
								: i
								? "Reserve"
								: "Standard"
						}: $${format(",.0f")(d)}`}
						data-tooltip-place={"top"}
					>
						<Box
							style={{
								marginTop: "2px",
								marginBottom: "2px",
								display: "flex",
								alignItems: "center",
								width: "100%",
								marginLeft: "8px",
							}}
						>
							<Box
								style={{
									width: scale(d) + "%",
									minWidth: "1px",
									height: "18px",
									transitionProperty: "width",
									transitionDuration: "0.75s",
									display: "flex",
									alignItems: "center",
									backgroundColor: i ? colorB : colorA,
								}}
							>
								<Typography
									fontSize={12}
									fontWeight={700}
									style={{
										position: "relative",
										left:
											scale(d) < limitScaleValueInPixels
												? "3px"
												: "-3px",
										marginLeft:
											scale(d) < limitScaleValueInPixels
												? "100%"
												: "auto",
										color: "#444",
									}}
								>
									{"$"}
									<NumberAnimator
										number={parseFloat(formatSIFloat(d))}
										numberType="decimal"
									/>
									{isNaN(+formatSIFloat(d).slice(-1))
										? formatSIFloat(d).slice(-1)
										: ""}
								</Typography>
							</Box>
						</Box>
					</Box>
				))}
			</Box>
			{chartType === "funds" && (
				<Box
					style={{
						flex: "0 12%",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Typography
						variant="body2"
						style={{
							fontSize: 12,
							color: "#444",
							border: "none",
							fontStyle: "italic",
						}}
					>
						<NumberAnimator
							number={cvaPercentage}
							numberType="integer"
						/>
						%
					</Typography>
				</Box>
			)}
		</Box>
	);
}

export default BarChartRow;
