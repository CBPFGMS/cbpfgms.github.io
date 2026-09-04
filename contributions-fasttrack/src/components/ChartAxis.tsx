import { scaleLinear } from "d3";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";

type ChartAxisProps = {
	maxValue: number;
};

function ChartAxis({ maxValue }: ChartAxisProps) {
	const scale = scaleLinear<number>()
		.domain([0, maxValue || 1])
		.range([0, 100]);

	const ticks = scale.ticks(5).filter(tick => tick > 0);

	return (
		<Box
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: "flex",
				flexDirection: "row",
				pointerEvents: "none",
				zIndex: 0,
				paddingLeft: "1em",
				paddingRight: "1em",
			}}
		>
			<Box style={{ flex: "0 18%" }} />
			<Box style={{ flex: "0 80%", position: "relative" }}>
				{ticks.map(tick => (
					<Box
						key={tick}
						style={{
							position: "absolute",
							left: `${scale(tick)}%`,
							top: "28px",
							bottom: "10px",
							width: "1px",
							backgroundColor: "rgba(0, 0, 0, 0.08)",
						}}
					>
						<Typography
							sx={{
								position: "absolute",
								top: "-14px",
								left: 0,
								transform: "translateX(-50%)",
								fontSize: 11,
								color: "#777",
								whiteSpace: "nowrap",
							}}
						>
							{`$${formatSIFloat(tick)}`}
						</Typography>
					</Box>
				))}
			</Box>
		</Box>
	);
}

export default ChartAxis;
