import { CvaSector } from "../utils/processcvasectors";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { max, scaleLinear } from "d3";
import { List } from "../utils/makelists";
import colors from "../utils/colors";
import { clustersIconsData } from "../assets/clustericons";
import { format } from "d3";
import constants from "../utils/constants";
import NumberAnimator from "./NumberAnimator";
import formatSIFloat from "../utils/formatsi";
import { CvaChartModes } from "./CvaChart";

type CvaSectorsProps = {
	data: CvaSector[];
	lists: List;
	cvaChartMode: CvaChartModes;
};

type SectorChartRowProps = {
	label: string;
	value: number;
	width: number;
	sector: number;
	cvaChartMode: CvaChartModes;
};

const { limitScaleValueInPixels } = constants;

function CvaSectors({ data, lists, cvaChartMode }: CvaSectorsProps) {
	const maxValue = max(data, d => d.value) ?? 0;

	const scale = scaleLinear<number, number, never>()
		.domain([0, maxValue])
		.range([0, 100]);

	return (
		<Box
			mt={4}
			style={{
				width: "96%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Typography
				mb={2}
				style={{
					fontSize: "1rem",
					fontWeight: 500,
					textTransform: "uppercase",
					paddingLeft: "28%",
				}}
			>
				Sectors
			</Typography>
			{data.map(d => (
				<SectorsChartRow
					key={d.sector}
					label={lists.sectors[d.sector]}
					value={d.value}
					width={scale(d.value)}
					sector={d.sector}
					cvaChartMode={cvaChartMode}
				/>
			))}
		</Box>
	);
}

function SectorsChartRow({
	label,
	value,
	width,
	sector,
	cvaChartMode,
}: SectorChartRowProps) {
	return (
		<Box
			display={"flex"}
			flexDirection={"row"}
			style={{ width: "100%" }}
			mt={0.5}
			mb={0.5}
		>
			<Box
				style={{
					flex: "0 28%",
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
					{label}
				</Typography>
				<img
					src={clustersIconsData[sector]}
					style={{
						width: "24px",
						height: "24px",
						marginLeft: "8px",
						marginRight: "6px",
						padding: "4px",
					}}
				/>
			</Box>
			<Box
				display={"flex"}
				flexDirection={"row"}
				alignItems={"center"}
				style={{ flex: "0 72%" }}
			>
				<Box
					style={{
						display: "flex",
						flexDirection: "row",
						width: "100%",
						alignItems: "center",
					}}
					data-tooltip-id="tooltip"
					data-tooltip-content={format(",.0f")(value)}
					data-tooltip-place="top"
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
								width: width + "%",
								minWidth: "1px",
								height: "18px",
								transitionProperty: "width",
								transitionDuration: "0.75s",
								display: "flex",
								alignItems: "center",
								backgroundColor: colors.unColor,
							}}
						>
							<Typography
								fontSize={12}
								fontWeight={700}
								style={{
									position: "relative",
									left:
										width < limitScaleValueInPixels
											? "3px"
											: "-3px",
									marginLeft:
										width < limitScaleValueInPixels
											? "100%"
											: "auto",
									color:
										width < limitScaleValueInPixels
											? "#444"
											: "#fff",
								}}
							>
								{cvaChartMode === "allocations" ? "$" : ""}
								<NumberAnimator
									number={parseFloat(formatSIFloat(value))}
									type="decimal"
								/>
								{isNaN(+formatSIFloat(value).slice(-1))
									? formatSIFloat(value).slice(-1)
									: ""}
							</Typography>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

export default CvaSectors;
