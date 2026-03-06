import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import type { DatumIndicators } from "../utils/processdataindicators";
import type { DownloadStates } from "./MainContainer";
import IndicatorsCarousel from "./IndicatorsCarousel";
import type { List } from "../utils/makelists";

type IndicatorsContainerProps = {
	dataIndicators: DatumIndicators[];
	lists: List;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
};

function IndicatorsContainer({
	dataIndicators,
	lists,
	clickedDownload,
	setClickedDownload,
}: IndicatorsContainerProps) {
	return (
		<Grid
			container
			spacing={2}
			mt={6}
			justifyContent={"center"}
		>
			<Grid size={12}>
				<Typography
					variant="h4"
					style={{
						fontFamily: "Montserrat",
						fontWeight: 600,
						textAlign: "center",
					}}
				>
					Global Indicators
				</Typography>
			</Grid>
			<Grid
				size={10}
				mb={3}
				justifyContent={"center"}
				display={"flex"}
				flexDirection={"column"}
			>
				<Typography
					variant="body1"
					style={{
						fontFamily: "Montserrat",
						fontSize: "18px",
						textAlign: "center",
					}}
				>
					These indicators are metrics used to assess the performance
					and impact of OCHA-funded projects. They cover various
					aspects such as beneficiary reach, funding allocation,
					response time, and intervention effectiveness. The goal is
					to provide better accountability and transparency in
					humanitarian operations.
				</Typography>
			</Grid>
			<Grid size={12}>
				{dataIndicators.length > 0 ? (
					<IndicatorsCarousel
						data={dataIndicators}
						lists={lists}
						clickedDownload={clickedDownload}
						setClickedDownload={setClickedDownload}
					/>
				) : (
					<NoData />
				)}
			</Grid>
		</Grid>
	);
}

function NoData() {
	return (
		<Grid
			container
			spacing={2}
			mt={6}
			mb={6}
			justifyContent={"center"}
		>
			<Grid
				size={10}
				justifyContent={"center"}
				display={"flex"}
				flexDirection={"column"}
			>
				<Typography
					variant="body1"
					style={{
						fontFamily: "Montserrat",
						fontSize: "1.2rem",
						textAlign: "center",
					}}
				>
					There is no data available for the selected fund.
					<br />
					Please try selecting a different fund or check back later.
				</Typography>
			</Grid>
		</Grid>
	);
}

const MemoizedIndicatorsContainer = React.memo(IndicatorsContainer);

export default MemoizedIndicatorsContainer;
