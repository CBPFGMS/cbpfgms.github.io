import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import Pictogram from "../assets/Pictogram";
import { scaleLinear, format } from "d3";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import colors from "../utils/colors";
import capitalizeString from "../utils/capitalizestring";
import { GenderAndAge } from "../utils/processrawdata";

type PictogramRowProps = {
	type: GenderAndAge;
	targeted: number;
	reached: number;
	maxNumberOfPictograms: number;
	maxValue: number;
};

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
				style={{
					flex: "0 12%",
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-end",
				}}
			>
				<Typography
					variant="body2"
					fontWeight={500}
					marginRight={0.5}
					style={{ color: "#555", border: "none" }}
				>
					{type.toUpperCase()}
				</Typography>
			</Box>
			<Box
				style={{
					flex: "0 78%",
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
						data-tooltip-content={`${capitalizeString(type)} ${
							i ? "reached" : "targeted"
						}: ${format(",.0f")(d)}`}
						data-tooltip-place="top"
					>
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
									type="decimal"
								/>
								{isNaN(+formatSIFloat(d).slice(-1))
									? formatSIFloat(d).slice(-1)
									: ""}
							</Typography>
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

export default PictogramRow;
