import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import { scaleLinear, format } from "d3";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import colors from "../utils/colors";
import { GenderAndAge } from "../utils/processrawdata";
import capitalizeString from "../utils/capitalizestring";
import constants from "../utils/constants";

type DisabilityChartRowProps = {
	type: GenderAndAge;
	targeted: number;
	reached: number;
	maxValue: number;
};

const { limitScaleValueInPixels } = constants;

function DisabilityChartRow({
	maxValue,
	reached,
	targeted,
	type,
}: DisabilityChartRowProps) {
	const scale = scaleLinear<number>().domain([0, maxValue]).range([0, 100]);

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
					flex: "0 22%",
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
					{capitalizeString(type)}
				</Typography>
			</Box>
			<Box
				style={{
					flex: "0 66%",
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
						data-tooltip-id="tooltip"
						data-tooltip-content={`${
							i ? "Reached" : "Targeted"
						}: ${format(",.0f")(d)}`}
						data-tooltip-place="top"
					>
						<Box
							style={{
								flex: "0 10%",
								display: "flex",
								flexDirection: "row",
								justifyContent: "flex-end",
								alignItems: "baseline",
								marginRight: "12px",
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
								flex: "0 90%",
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

export default DisabilityChartRow;
