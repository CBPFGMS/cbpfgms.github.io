import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Tooltip } from "react-tooltip";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import Pictogram from "../assets/Pictogram";
import { scaleLinear } from "d3-scale";
import { format } from "d3-format";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import colors from "../utils/colors";

function PictogramRow({
	type,
	reached,
	targeted,
	maxNumberOfPictograms,
	maxValue,
}: PictogramRowProps) {
	const pictogramWidth = 12;
	const numberOfPictogramsArray = Array.from(
		Array(maxNumberOfPictograms).keys()
	);

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
				style={{ flex: "0 15%", display: "flex", alignItems: "center" }}
			>
				<Typography
					variant="body2"
					fontWeight={500}
					style={{ color: "#555", border: "none" }}
				>
					{type.toUpperCase()}
				</Typography>
			</Box>
			<Box
				style={{
					flex: "0 75%",
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
						data-tooltip-content={`${capitalizeString(type)} ${
							i ? "reached" : "targeted"
						}: ${format(",.0f")(d)}`}
						data-tooltip-place="top"
					>
						<Tooltip id={"tooltip-" + type + "-" + i} />
						<Box
							style={{
								flex: "0 28%",
								display: "flex",
								flexDirection: "row",
								justifyContent: "flex-end",
								alignItems: "baseline",
								marginRight: "12px",
							}}
						>
							<Typography
								variant="body2"
								fontWeight={500}
								fontSize={i ? 24 : 18}
								style={{ color: "#222", border: "none" }}
							>
								<NumberAnimator
									number={parseFloat(formatSIFloat(d))}
								/>
								{formatSIFloat(d).slice(-1)}
							</Typography>
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
								flex: "0 72%",
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
									overflow: "hidden",
									display: "flex",
									flexWrap: "nowrap",
									transitionProperty: "width",
									transitionDuration: "0.75s",
								}}
							>
								{numberOfPictogramsArray.map((_, j) => (
									<Pictogram
										svgProps={{
											style: {
												width: pictogramWidth,
												fill: i
													? colors.unColor
													: colors.contrastColorLighter,
											},
										}}
										type={type}
										key={j}
									/>
								))}
							</Box>
						</Box>
					</Box>
				))}
			</Box>
			<Box
				style={{
					flex: "0 10%",
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

function capitalizeString(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export default PictogramRow;
