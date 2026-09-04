import { scaleLinear } from "d3";
import type { Data } from "../utils/processcontributions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ContributionType } from "./MainContainer";
import colors from "../utils/colors";
import NumberAnimator from "./NumberAnimator";
import formatSIFloat from "../utils/formatsi";

type ChartRowProps = {
	data: Data[number];
	isStacked: boolean;
	maxValue: number;
	contributionType: ContributionType;
};

function ChartRow({
	data,
	isStacked,
	maxValue,
	contributionType,
}: ChartRowProps) {
	const scale = scaleLinear<number>()
		.domain([0, maxValue || 1])
		.range([0, 100]);

	const thisValue = data[contributionType];

	return (
		<Box
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				width: "100%",
				paddingTop: "4px",
				paddingBottom: "4px",
			}}
		>
			<Box
				style={{
					flex: "0 18%",
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-end",
					textAlign: "right",
					overflow: "hidden",
				}}
			>
				<Typography
					sx={{
						color: "#333",
						border: "none",
						fontSize: 15,
						fontWeight: 400,
						paddingRight: "8px",
					}}
				>
					{data.name}
				</Typography>
			</Box>
			<Box
				style={{
					flex: "0 80%",
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
				}}
				data-tooltip-id="tooltip"
				data-tooltip-content={`$${thisValue.toLocaleString()}`}
				data-tooltip-place="top"
			>
				<Box
					style={{
						display: "flex",
						flexDirection: "row",
						width: "100%",
						alignItems: "center",
					}}
				>
					<Box
						style={{
							width: scale(thisValue) + "%",
							minWidth: "1px",
							height: "14px",
							transitionProperty: "width",
							transitionDuration: "0.75s",
							display: "flex",
							alignItems: "center",
							backgroundColor: colors.unColor,
						}}
					></Box>
					<Typography
						sx={{
							fontSize: 14,
							fontWeight: 700,
							marginLeft: 0,
							color: "#444",
							paddingLeft: "4px",
						}}
					>
						{"$"}
						<NumberAnimator
							number={parseFloat(formatSIFloat(thisValue))}
							type="decimal"
						/>
						{isNaN(+formatSIFloat(thisValue).slice(-1))
							? formatSIFloat(thisValue).slice(-1)
							: ""}
					</Typography>
				</Box>
			</Box>
		</Box>
	);
}

export default ChartRow;
