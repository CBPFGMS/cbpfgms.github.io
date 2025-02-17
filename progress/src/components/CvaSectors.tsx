import { CvaSector } from "../utils/processcvasectors";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { max } from "d3";
import { List } from "../utils/makelists";
import { CvaChartModes } from "./CvaChart";
import BarChartRow from "./BarChartRow";

type CvaSectorsProps = {
	data: CvaSector[];
	lists: List;
	cvaChartMode: CvaChartModes;
};

function CvaSectors({ data, lists, cvaChartMode }: CvaSectorsProps) {
	const maxValue = max(data, d => Math.max(d.targeted, d.reached)) ?? 0;

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
				style={{
					fontSize: "1rem",
					fontWeight: 500,
					textTransform: "uppercase",
					paddingLeft: "28%",
				}}
			>
				Sectors
			</Typography>
			<Box
				display={"flex"}
				flexDirection={"column"}
				width={"95%"}
				marginLeft={"3%"}
				alignItems={"center"}
				gap={2}
			>
				<Box
					display={"flex"}
					flexDirection={"row"}
					width={"100%"}
				>
					<Box flex={"0 88%"} />
					<Box
						mb={-2}
						style={{
							display: "flex",
							flex: "0 12%",
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "center",
							textAlign: "center",
							width: "100%",
						}}
					>
						<Typography
							variant="body2"
							fontSize={12}
							style={{
								color: "#222",
								border: "none",
								fontStyle: "italic",
								letterSpacing: "-0.05em",
							}}
						>
							Reached as %<br />
							of targeted
						</Typography>
					</Box>
				</Box>
				{data.map(d => (
					<BarChartRow
						key={d.sector}
						list={lists.sectors}
						targeted={d.targeted}
						reached={d.reached}
						maxValue={maxValue}
						chartType="sectors"
						type={d.sector}
						isAllocation={cvaChartMode === "allocations"}
					/>
				))}
			</Box>
		</Box>
	);
}

export default CvaSectors;
