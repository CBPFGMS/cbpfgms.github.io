import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import formatSIFloat from "../utils/formatsi";
import NumberAnimator from "./NumberAnimator";
import { scaleLinear, format } from "d3";
import colors from "../utils/colors";
import { type List, type ListObj } from "../utils/makelists";
import { type Charts } from "./MainContainer";
import { clustersIconsData } from "../assets/clustericons";
import { agencyIconsData, unIcon } from "../assets/agencyicons";
import type { AllocationWindows } from "../utils/processdatasummary";
import { sum } from "d3";

export type BarChartRowProps = {
	type: number;
	rr: number;
	ufe: number;
	maxValue: number;
	lists: List;
	listProperty: keyof List;
	chartType: Charts;
	fromCva?: boolean;
	totalCvaPercentage?: number | boolean;
};

type SortedDatum = {
	window: AllocationWindows;
	value: number;
	windowName: string;
};

function BarChartRow({
	lists,
	listProperty,
	maxValue,
	ufe,
	rr,
	type,
	chartType,
	fromCva = false,
	totalCvaPercentage = false,
}: BarChartRowProps) {
	const scale = scaleLinear<number>().domain([0, maxValue]).range([0, 100]);

	const calcAmount =
		fromCva && typeof totalCvaPercentage === "number" ? "5%" : "0%";

	const sortedData: SortedDatum[] = [rr, ufe].map<SortedDatum>((d, i) => ({
		value: d,
		window: i ? "ufe" : "rr",
		windowName: i ? "Underfunded Emergencies" : "Rapid Response",
	}));

	const total = sum(sortedData, d => d.value);

	return (
		<Box
			data-tooltip-id="tooltip"
			data-tooltip-html={`${
				listProperty === "organizationsAcronym"
					? `<div style='width:100%;margin-bottom:0.5em;text-align:center;font-weight:500;'>${lists.organizations[type]}</div>`
					: ""
			}
			<div style='display:table;width:100%;border-spacing:2px 0;'><div style='display:table-row;'><div style='display:table-cell;padding-right:12px;text-align:right;'>Total:</div><div style='display:table-cell;text-align:right;'>$${format(
				",.2f"
			)(
				total
			)}</div></div><div style='display:table-row;'><div style='display:table-cell;padding-right:12px;text-align:right;'>${
				sortedData[0].windowName
			} (${format(".1%")(
				sortedData[0].value / total
			)}):</div><div style='display:table-cell;text-align:right;'>$${format(
				",.2f"
			)(
				sortedData[0].value
			)}</div></div><div style='display:table-row;'><div style='display:table-cell;padding-right:12px;text-align:right;'>${
				sortedData[1].windowName
			} (${format(".1%")(
				sortedData[1].value / total
			)}):</div><div style='display:table-cell;text-align:right;'>$${format(
				",.2f"
			)(sortedData[1].value)}</div></div></div>`}
			data-tooltip-place="top"
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				width: "100%",
			}}
		>
			<Box
				style={{
					flex:
						chartType === "sectors" || chartType === "agencies"
							? "0 20% "
							: "0 18% ",
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
					{(lists[listProperty] as ListObj)[type]}
				</Typography>
				{chartType === "sectors" && (
					<img
						src={clustersIconsData[type]}
						style={{
							width: "26px",
							height: "26px",
							marginLeft: "8px",
							marginRight: "4px",
							padding: "4px",
						}}
					/>
				)}
				{chartType === "agencies" && (
					<img
						src={agencyIconsData[type] ?? unIcon}
						style={{
							width: "26px",
							height: "26px",
							marginLeft: "8px",
							marginRight: "4px",
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
						chartType === "sectors" || chartType === "agencies"
							? `0 calc(74% - ${calcAmount})`
							: `0 calc(76% - ${calcAmount})`,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					position: "relative",
				}}
			>
				{sortedData.map((d, i) => (
					<Box
						style={{
							display: "flex",
							flexDirection: "row",
							width: "100%",
							alignItems: "center",
							position: "absolute",
							top: 0,
							left: 0,
							transform: "translateY(-50%",
						}}
						key={i}
					>
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
									width: scale(i ? d.value : total) + "%",
									height: "18px",
									transitionProperty: "width",
									transitionDuration: "0.75s",
									display: "flex",
									alignItems: "center",
									backgroundColor: colors[`${d.window}Color`],
								}}
							>
								{!i && (
									<Typography
										fontSize={12}
										fontWeight={700}
										style={{
											position: "relative",
											left: "3px",

											marginLeft: "100%",
											color: "#444",
										}}
									>
										{"$"}
										<NumberAnimator
											number={parseFloat(
												formatSIFloat(total)
											)}
											type="decimal"
										/>
										{isNaN(+formatSIFloat(total).slice(-1))
											? formatSIFloat(total).slice(-1)
											: ""}
									</Typography>
								)}
							</Box>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
}

export default BarChartRow;
