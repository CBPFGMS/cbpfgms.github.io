import Box from "@mui/material/Box";
// import createPictogramChart from "../charts/createtopchart";
import Typography from "@mui/material/Typography";
import { Tooltip } from "react-tooltip";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import { useState, useEffect, useRef } from "react";
import Pictogram from "../assets/Pictogram";
import { scaleLinear } from "d3-scale";
import { format } from "d3-format";

const unColor = "#418fde";

function PictogramRow({
	type,
	reached,
	targeted,
	setMaxNumberOfPictograms,
	maxValue,
}: PictogramRowProps) {
	const [divWidth, setDivWidth] = useState<number>(0);
	const divRef = useRef<HTMLDivElement>(null);

	const pictogramWidth = 12;
	const numberOfPictograms = Math.floor(divWidth / pictogramWidth);
	const numberOfPictogramsArray = Array.from(
		Array(numberOfPictograms).keys()
	);

	const scale = scaleLinear<number>().domain([0, maxValue]).range([0, 100]);

	useEffect(() => {
		const divWidth = divRef.current?.offsetWidth;
		if (divWidth) {
			setDivWidth(divWidth);
			setMaxNumberOfPictograms(numberOfPictograms);
		}
	}, [numberOfPictograms, setMaxNumberOfPictograms]);

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
					flex: "0 85%",
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
					>
						<Tooltip id={"tooltip-" + type + "-" + i} />
						<Box
							style={{
								flex: "0 32%",
								display: "flex",
								flexDirection: "row",
								justifyContent: "flex-end",
								alignItems: "baseline",
								marginRight: "8px",
							}}
							data-tooltip-id={"tooltip-" + type + "-" + i}
							data-tooltip-content={`${capitalizeString(type)} ${
								i ? "reached" : "targeted"
							}: ${format(",.0f")(d)}`}
							data-tooltip-place="top"
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
									color: "#555",
									border: "none",
									marginLeft: "4px",
								}}
							>
								{i ? "Reached" : "Targeted"}
							</Typography>
						</Box>
						<Box
							ref={divRef}
							style={{
								flex: "0 68%",
								marginTop: "6px",
								marginBottom: "6px",
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
								{numberOfPictogramsArray.map((_, i) => (
									<Pictogram
										svgProps={{
											style: {
												width: pictogramWidth,
												fill: unColor,
											},
										}}
										type={type}
										key={i}
									/>
								))}
							</Box>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
}

function capitalizeString(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export default PictogramRow;
