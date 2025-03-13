import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import { scaleLinear, format } from "d3";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import colors from "../utils/colors";
import { ListObj } from "../utils/makelists";
import { Charts } from "./MainContainer";
import { clustersIconsData } from "../assets/clustericons";
import constants from "../utils/constants";

export type BarChartRowProps = {
	type: number;
	targeted: number;
	reached: number;
	maxValue: number;
	list: ListObj;
	chartType: Charts;
	fromCva?: boolean;
	isAllocation?: boolean;
	totalCvaPercentage?: number;
};

const { limitScaleValueInPixels } = constants;

function BarChartRow({
	list,
	maxValue,
	reached,
	targeted,
	type,
	chartType,
	fromCva = false,
	isAllocation = false,
	totalCvaPercentage = 0,
}: BarChartRowProps) {
	const scale = scaleLinear<number>().domain([0, maxValue]).range([0, 100]);

	const calcAmount = fromCva ? "5%" : "0%";

	console.log(totalCvaPercentage);

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
					flex: chartType === "sectors" ? "0 26% " : "0 22% ",
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
					{list[type]}
				</Typography>
				{chartType === "sectors" && (
					<img
						src={clustersIconsData[type]}
						style={{
							width: "32px",
							height: "32px",
							marginLeft: "12px",
							marginRight: "0px",
							padding: "4px",
						}}
					/>
				)}
			</Box>
			{fromCva && (
				<Box
					style={{
						flex: `0 ${calcAmount}`,
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
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
						<NumberAnimator
							number={totalCvaPercentage}
							type="integer"
						/>
						{"%)"}
					</Typography>
				</Box>
			)}
			<Box
				style={{
					flex:
						chartType === "sectors"
							? `0 calc(62% - ${calcAmount})`
							: `0 calc(66% - ${calcAmount})`,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				{[targeted, reached].map((d, i) => (
					<Box
						style={{
							display: "flex",
							flexDirection: "row",
							width: "100%",
							alignItems: "center",
						}}
						key={i}
						{...(!fromCva && {
							"data-tooltip-id": "tooltip",
							"data-tooltip-content": `${
								i ? "Reached" : "Targeted"
							}: ${isAllocation ? "$" : ""}${format(",.0f")(d)}`,
							"data-tooltip-place": "top",
						})}
					>
						<Box
							style={{
								display: "flex",
								flexDirection: "row",
								justifyContent: "flex-end",
								alignItems: "baseline",
								marginRight: "12px",
								marginLeft:
									chartType === "sectors" ? "12px" : "4px",
							}}
						>
							<Typography
								variant="body2"
								fontWeight={400}
								style={{
									border: "none",
									display: "flex",
									alignItems: "center",
								}}
							>
								{i ? (
									<DoneIcon
										style={{
											fontSize: 18,
											marginLeft: 3,
											color: "#777",
											opacity: 0.6,
										}}
									/>
								) : (
									<AdsClickIcon
										style={{
											fontSize: 18,
											marginLeft: 3,
											color: "#777",
											opacity: 0.6,
										}}
									/>
								)}
							</Typography>
						</Box>
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
									width: scale(d) + "%",
									minWidth: "1px",
									height: "18px",
									transitionProperty: "width",
									transitionDuration: "0.75s",
									display: "flex",
									alignItems: "center",
									backgroundColor: i
										? colors.unColor
										: colors.contrastColorLighter,
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
										color:
											scale(d) < limitScaleValueInPixels
												? "#444"
												: "#fff",
									}}
								>
									{isAllocation ? "$" : ""}
									<NumberAnimator
										number={parseFloat(formatSIFloat(d))}
										type="decimal"
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
						number={~~((reached * 100) / targeted)}
						type="integer"
					/>
					%
				</Typography>
			</Box>
		</Box>
	);
}

export default BarChartRow;
