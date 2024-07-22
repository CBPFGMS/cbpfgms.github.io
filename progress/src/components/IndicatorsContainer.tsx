import { useState, useEffect } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import Loading from "./Loading";
import Button from "@mui/material/Button";
import { DatumIndicators } from "../utils/processdataindicators";
import indicatorsApi from "../utils/indicatorsapi";
import { RefIds } from "./MainContainer";
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
};

function IndicatorsContainer({
	year,
	fund,
	allocationSource,
	allocationType,
	indicatorsRef,
	refIds,
	lists,
}: IndicatorsContainerProps) {
	const [indicatorsData, setIndicatorsData] = useState<
			DatumIndicators[] | null
		>(null),
		[loading, setLoading] = useState<boolean>(false),
		[error, setError] = useState<string | null>(null),
		[hasFetchedData, setHasFetchedData] = useState<boolean>(false);

	function handleClick() {
		indicatorsApi({
			setIndicatorsData,
			setLoading,
			setError,
			setHasFetchedData,
		});
	}

	useEffect(() => {
		setHasFetchedData(false);
	}, [year, fund, allocationSource, allocationType]);

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
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
					do eiusmod tempor incididunt ut labore et dolore magna
					aliqua. Ut enim ad minim veniam, quis nostrud exercitation
					ullamco laboris nisi ut aliquip ex ea commodo consequat.
					Duis aute irure dolor in reprehenderit in voluptate velit
					esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
					occaecat cupidatat non proident, sunt in culpa qui officia
					deserunt mollit anim id est laborum.
				</Typography>
				<Button
					data-tooltip-id="tooltip"
					data-tooltip-content={
						"The table will be generated based on the selected filters"
					}
					data-tooltip-place="top"
					variant="contained"
					disabled={hasFetchedData}
					onClick={handleClick}
					style={{ marginTop: "2em", alignSelf: "center" }}
				>
					Generate Table
				</Button>
			</Grid>
			<Grid
				xs={12}
				mt={3}
			>
				{loading && <Loading />}
				{error && <Typography variant="body1">{error}</Typography>}
				{indicatorsData && hasFetchedData && (
					<IndicatorsCarousel
						data={indicatorsData}
						lists={lists}
					/>
				)}
			</Grid>
		</Grid>
	);
}

export default IndicatorsContainer;
