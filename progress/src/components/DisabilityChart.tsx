import React, { useContext, useRef } from "react";
import { DatumDisability } from "../utils/processdatasummary";
import { DownloadStates, ImplementationStatuses } from "./MainContainer";
import constants from "../utils/constants";
import DataContext, { DataContextType } from "../context/DataContext";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { max, format } from "d3";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import colors from "../utils/colors";
import DisabilityChartRow from "./DisabilityChartRow";
import capitalizeString from "../utils/capitalizestring";
import { processDisabilityDownload } from "../utils/processdownload";
import downloadData from "../utils/downloaddata";
import DownloadAndImageContainer from "./DownloadAndImageContainer";

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

	const ref = useRef<HTMLDivElement>(null);

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
			ref={ref}
		>
			<DownloadAndImageContainer
				handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type="disability"
				refElement={ref}
				fileName="people_with_disability"
			/>
			<Box
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "58px",
					flexDirection: "column",
				}}
				mb={3}
			>
				<Typography
					style={{
						fontSize: "1rem",
						fontWeight: 500,
						textTransform: "uppercase",
					}}
				>
					Persons with disabilities, Targeted and Reached
				</Typography>
				<Typography
					style={{
						fontSize: "0.8rem",
						display: "flex",
						alignItems: "center",
					}}
				>
					{"("}
					<AdsClickIcon
						style={{
							fontSize: 18,
							marginLeft: 3,
							marginRight: 3,
							color: "#777",
							opacity: 0.6,
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
							marginRight: 3,
							color: "#777",
							opacity: 0.6,
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
			<Box
				width={"100%"}
				display={"flex"}
				justifyContent={"center"}
				mt={5}
			>
				<Typography
					variant="caption"
					sx={{ lineHeight: 1.2, width: "80%", fontStyle: "italic" }}
				>
					The data on people with disabilities reached, as reported in
					the latest programmatic reports, was identified from{" "}
					{format(".1~%")(
						dataDisability.reportsWithData /
							dataDisability.totalReports
					)}{" "}
					of the projects.
				</Typography>
			</Box>
		</Container>
	);
}

const MemoisedDisabilityChart = React.memo(DisabilityChart);

export default MemoisedDisabilityChart;
