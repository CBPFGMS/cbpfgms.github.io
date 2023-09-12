import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Tooltip } from "react-tooltip";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import { scaleLinear } from "d3-scale";
import { format } from "d3-format";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import colors from "../utils/colors";

function TypeAndSectorRow({
	list,
	maxValue,
	reached,
	targeted,
	type,
}: TypeAndSectorRowProps) {
	const scale = scaleLinear<number>().domain([0, maxValue]).range([0, 100]);
	const limitValue = 90;

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
					flex: "0 18%",
					display: "flex",
					alignItems: "center",
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
			</Box>
			<Box
				style={{
					flex: "0 70%",
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
						data-tooltip-id={"tooltip-" + type + "-" + i}
						data-tooltip-content={`${
							i ? "Reached" : "Targeted"
						}: ${format(",.0f")(d)}`}
						data-tooltip-place="top"
					>
						<Tooltip id={"tooltip-" + type + "-" + i} />
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
								}}
							>
								{i ? (
									<DoneIcon
										style={{
											fontSize: 18,
											marginLeft: 3,
											color: "#777",
											opacity: 0.6,
											marginBottom: "-2px",
										}}
									/>
								) : (
									<AdsClickIcon
										style={{
											fontSize: 18,
											marginLeft: 3,
											color: "#777",
											opacity: 0.6,
											marginBottom: "-3px",
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
											scale(d) < limitValue
												? "3px"
												: "-3px",
										marginLeft:
											scale(d) < limitValue
												? "100%"
												: "auto",
										color:
											scale(d) < limitValue
												? "#444"
												: "#fff",
									}}
								>
									<NumberAnimator
										number={parseFloat(formatSIFloat(d))}
									/>
									{formatSIFloat(d).slice(-1)}
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
					<NumberAnimator number={~~((reached * 100) / targeted)} />%
				</Typography>
			</Box>
		</Box>
	);
}

export default TypeAndSectorRow;
