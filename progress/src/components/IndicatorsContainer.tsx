import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { DatumIndicators } from "../utils/processdataindicators";
import { GlobalIndicatorsObject } from "../utils/schemas";
import {
	DownloadStates,
	ImplementationStatuses,
	RefIds,
} from "./MainContainer";
import IndicatorsCarousel from "./IndicatorsCarousel";
import { List } from "../utils/makelists";
import processDataIndicators from "../utils/processdataindicators";

type IndicatorsContainerProps = {
	dataIndicators: GlobalIndicatorsObject[];
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	indicatorsRef: (node?: Element | null | undefined) => void;
	refIds: RefIds;
	lists: List;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	implementationsStatus: ImplementationStatuses[];
	showFinanciallyClosed: boolean;
};

function IndicatorsContainer({
	dataIndicators,
	year,
	fund,
	allocationSource,
	allocationType,
	indicatorsRef,
	refIds,
	lists,
	clickedDownload,
	setClickedDownload,
	implementationsStatus,
	showFinanciallyClosed,
}: IndicatorsContainerProps) {
	const [indicatorsFilteredData, setIndicatorsFilteredData] = useState<
			DatumIndicators[]
		>([]),
		[generateTable, setGenerateTable] = useState<boolean>(false);

	function handleClick() {
		setGenerateTable(true);
	}

	useEffect(() => {
		const filteredIndicators = processDataIndicators({
			dataIndicators,
			lists,
			year,
			fund,
			allocationSource,
			allocationType,
			implementationsStatus,
			showFinanciallyClosed,
		});
		if (filteredIndicators.length === 0) {
			setGenerateTable(false);
		}
		setIndicatorsFilteredData(filteredIndicators);
	}, [
		dataIndicators,
		year,
		fund,
		allocationSource,
		allocationType,
		lists,
		implementationsStatus,
		showFinanciallyClosed,
	]);

	return (
		<Grid
			container
			spacing={2}
			mt={6}
			justifyContent={"center"}
		>
			<Grid
				size={12}
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
				<Button
					data-tooltip-id="tooltip"
					data-tooltip-content={
						"The table will be generated based on the selected filters"
					}
					data-tooltip-place="top"
					variant="contained"
					disabled={generateTable || !indicatorsFilteredData?.length}
					onClick={handleClick}
					style={{ marginTop: "2em", alignSelf: "center" }}
				>
					{indicatorsFilteredData?.length
						? "Generate Table"
						: "No Global Indicators for the filters selected"}
				</Button>
			</Grid>
			<Grid size={12}>
				{indicatorsFilteredData.length > 0 && generateTable && (
					<IndicatorsCarousel
						data={indicatorsFilteredData}
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
