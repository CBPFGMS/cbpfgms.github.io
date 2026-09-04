import { scaleLinear } from "d3";
import type { Data } from "../utils/processcontributions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ContributionType } from "./MainContainer";
import colors from "../utils/colors";
import NumberAnimator from "./NumberAnimator";
import formatSIFloat from "../utils/formatsi";
import { constants } from "../utils/constants";

type ChartRowProps = {
	data: Data[number];
	isStacked: boolean;
	maxValue: number;
	contributionType: ContributionType;
};

const { chartRowHeight } = constants;

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

	const thisStackedValue =
		isStacked && contributionType === "total" ? data.pledged : 0;

	const firstBarValue =
		isStacked && contributionType === "total" ? data.paid : thisValue;

	const tooltipText =
		isStacked && contributionType === "total"
			? `Total: $${data.total.toLocaleString()}\nPaid: $${data.paid.toLocaleString()}\nPledged: $${data.pledged.toLocaleString()}`
			: `$${thisValue.toLocaleString()}`;

	return (
		<Box
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				width: "100%",
				height: `${chartRowHeight}px`,
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
						fontSize: 16,
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
				data-tooltip-content={tooltipText}
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
							width: scale(firstBarValue) + "%",
							minWidth: "1px",
							height: "14px",
							transitionProperty: "width",
							transitionDuration: "0.75s",
							display: "flex",
							alignItems: "center",
							backgroundColor: colors.unColorTotal,
						}}
					></Box>
					<Box
						style={{
							width: scale(thisStackedValue) + "%",
							height: "14px",
							transitionProperty: "width",
							transitionDuration: "0.75s",
							display: "flex",
							alignItems: "center",
							backgroundColor: colors.unColorPledged,
						}}
					></Box>
					<Typography
						sx={{
							fontSize: 15,
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
