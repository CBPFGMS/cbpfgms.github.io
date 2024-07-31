import React, { useContext } from "react";
import { DatumDisability } from "../utils/processdatasummary";
import { DownloadStates, ImplementationStatuses } from "./MainContainer";
import constants from "../utils/constants";
import DataContext, { DataContextType } from "../context/DataContext";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DownloadIcon from "./DownloadIcon";
import Container from "@mui/material/Container";
import { max } from "d3";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import colors from "../utils/colors";
import DisabilityChartRow from "./DisabilityChartRow";
import capitalizeString from "../utils/capitalizestring";
import { processDisabilityDownload } from "../utils/processdownload";
import downloadData from "../utils/downloaddata";

type DisabilityChartProps = {
	dataDisability: DatumDisability;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationStatus: ImplementationStatuses[];
};

const { beneficiaryCategories } = constants;

function DisabilityChart({
	dataDisability,
	clickedDownload,
	setClickedDownload,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
}: DisabilityChartProps) {
	const { data, lists } = useContext(DataContext) as DataContextType;

	const maxValue = max(Object.values(dataDisability)) || 0;

	function handleDownloadClick() {
		const dataDisabilityDownload = processDisabilityDownload({
			data,
			lists,
			year,
			fund,
			allocationSource,
			allocationType,
			implementationStatus,
		});
		downloadData<(typeof dataDisabilityDownload)[number]>(
			dataDisabilityDownload,
			"people_with_disability"
		);
	}

	return (
		<Container
			disableGutters={true}
			style={{
				position: "relative",
			}}
		>
			<DownloadIcon
				handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type="disability"
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
					People with Disability, Targeted and Reached
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
				{beneficiaryCategories.map(type => (
					<DisabilityChartRow
						key={type}
						type={type}
						targeted={
							dataDisability[
								`targeted${capitalizeString(
									type
								)}` as keyof DatumDisability
							]
						}
						reached={
							dataDisability[
								`reached${capitalizeString(
									type
								)}` as keyof DatumDisability
							]
						}
						maxValue={maxValue}
					/>
				))}
			</Box>
		</Container>
	);
}

const MemoisedDisabilityChart = React.memo(DisabilityChart);

export default MemoisedDisabilityChart;
