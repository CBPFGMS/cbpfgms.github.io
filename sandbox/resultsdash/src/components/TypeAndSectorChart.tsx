import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DownloadIcon from "./DownloadIcon";
import Container from "@mui/material/Container";
import { max } from "d3-array";
import TypeAndSectorRow from "./TypeAndSectorRow";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import colors from "../utils/colors";

function TypeAndSectorChart({
	data,
	list,
	clickedDownload,
	title,
	chartType,
	setClickedDownload,
}: TypesAndSectorChartProps) {
	const maxValue = max(
		data.map(d => Math.max(d.reached, d.targeted))
	) as number;

	return (
		<Container
			disableGutters={true}
			style={{
				position: "relative",
			}}
		>
			<DownloadIcon
				handleDownloadClick={() => console.log("download")}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type={chartType}
			/>
			<Box
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "58px",
					flexDirection: "column",
				}}
				mb={2}
			>
				<Typography
					style={{
						fontSize: "1rem",
						fontWeight: 500,
						textTransform: "uppercase",
					}}
				>
					{title}
				</Typography>
				<Typography
					style={{
						fontSize: "0.8rem",
					}}
				>
					{"("}
					<AdsClickIcon
						style={{
							fontSize: 18,
							marginLeft: 3,
							color: "#777",
							opacity: 0.6,
							marginBottom: "-3px",
						}}
					/>
					{
						<span style={{ color: colors.contrastColorDarker }}>
							{" "}
							targeted,{" "}
						</span>
					}
					<DoneIcon
						style={{
							fontSize: 18,
							marginLeft: 3,
							color: "#777",
							opacity: 0.6,
							marginBottom: "-3px",
						}}
					/>
					{<span style={{ color: colors.unColor }}> reached)</span>}
				</Typography>
			</Box>
			<Box
				display={"flex"}
				flexDirection={"column"}
				width={"95%"}
				marginLeft={"3%"}
				alignItems={"center"}
				gap={2}
				marginTop={2}
			>
				<Box
					mb={-2}
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "flex-end",
						textAlign: "right",
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
				{data.map(d => (
					<TypeAndSectorRow
						key={
							chartType === "beneficiaryTypes"
								? (d as BeneficiaryTypeData).beneficiaryType
								: (d as SectorsData).sector
						}
						type={
							chartType === "beneficiaryTypes"
								? (d as BeneficiaryTypeData).beneficiaryType
								: (d as SectorsData).sector
						}
						targeted={d.targeted}
						reached={d.reached}
						maxValue={maxValue}
						list={list}
					/>
				))}
			</Box>
		</Container>
	);
}

export default TypeAndSectorChart;
