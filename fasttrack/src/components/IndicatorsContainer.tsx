import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import type { DatumIndicators } from "../utils/processdataindicators";
import type { DownloadStates } from "./MainContainer";
import IndicatorsCarousel from "./IndicatorsCarousel";
import type { List } from "../utils/makelists";

type IndicatorsContainerProps = {
	dataIndicators: DatumIndicators[];
	fund: number[];
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
						fontSize: "14px",
						textAlign: "center",
					}}
				>
					The Global Indicators are a set of metrics used to access
					and measure the performance and impact of projects funded by
					OCHA. These indicators cover various aspects of humanitarian
					response, including beneficiary reach, funding allocation,
					response time, and the effectiveness of interventions. They
					provide a standardized framework for monitoring and
					evaluating OCHA-funded projects, allowing for better
					accountability and transparency
				</Typography>
			</Grid>
			<Grid size={12}>
				<IndicatorsCarousel
					data={dataIndicators}
					lists={lists}
					clickedDownload={clickedDownload}
					setClickedDownload={setClickedDownload}
				/>
			</Grid>
		</Grid>
	);
}

const MemoizedIndicatorsContainer = React.memo(IndicatorsContainer);

export default MemoizedIndicatorsContainer;
