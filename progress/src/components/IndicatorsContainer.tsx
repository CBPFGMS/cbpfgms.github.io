import { useState, useEffect } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import Loading from "./Loading";
import Button from "@mui/material/Button";
import { DatumIndicators } from "../utils/processdataindicators";
import indicatorsApi from "../utils/indicatorsapi";
import { DownloadStates, RefIds } from "./MainContainer";
import IndicatorsCarousel from "./IndicatorsCarousel";
import { List } from "../utils/makelists";

type IndicatorsContainerProps = {
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	indicatorsRef: (node?: Element | null | undefined) => void;
	refIds: RefIds;
	lists: List;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	defaultFundType: number | null;
};

function IndicatorsContainer({
	year,
	fund,
	allocationSource,
	allocationType,
	indicatorsRef,
	refIds,
	lists,
	clickedDownload,
	setClickedDownload,
	defaultFundType,
}: IndicatorsContainerProps) {
	const [indicatorsData, setIndicatorsData] = useState<
			DatumIndicators[] | null
		>(null),
		[loading, setLoading] = useState<boolean>(false),
		[error, setError] = useState<string | null>(null),
		[generateTable, setGenerateTable] = useState<boolean>(false);

	function handleClick() {
		setGenerateTable(true);
	}

	useEffect(() => {
		setGenerateTable(false);
		indicatorsApi({
			setIndicatorsData,
			setLoading,
			setError,
			lists,
			year,
			fund,
			allocationSource,
			allocationType,
			defaultFundType,
		});
	}, [year, fund, allocationSource, allocationType, defaultFundType, lists]);

	return (
		<Grid
			container
			spacing={2}
			mt={6}
			justifyContent={"center"}
		>
			<Grid
				xs={12}
				ref={indicatorsRef}
				id={refIds.indicatorsRefId}
			>
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
				xs={10}
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
				<Button
					data-tooltip-id="tooltip"
					data-tooltip-content={
						"The table will be generated based on the selected filters"
					}
					data-tooltip-place="top"
					variant="contained"
					disabled={generateTable || !indicatorsData?.length}
					onClick={handleClick}
					style={{ marginTop: "2em", alignSelf: "center" }}
				>
					{indicatorsData?.length
						? "Generate Table"
						: "No Global Indicators for the filters selected"}
				</Button>
			</Grid>
			<Grid xs={12}>
				{loading && <Loading />}
				{error && <Typography variant="body1">{error}</Typography>}
				{indicatorsData && generateTable && (
					<IndicatorsCarousel
						data={indicatorsData}
						lists={lists}
						clickedDownload={clickedDownload}
						setClickedDownload={setClickedDownload}
					/>
				)}
			</Grid>
		</Grid>
	);
}

export default IndicatorsContainer;
