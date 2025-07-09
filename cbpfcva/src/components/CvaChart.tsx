import React, { useContext, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { DatumCvaTypes } from "../utils/processdata";
import type { List } from "../utils/makelists";
import type { DownloadStates } from "./MainContainer";
import DataContext, { type DataContextType } from "../context/DataContext";
import { max, sum } from "d3";
import { processCvaTypesDownload } from "../utils/processdownload";
import downloadData from "../utils/downloaddata";
import Container from "@mui/material/Container";
import DownloadAndImageContainer from "./DownloadAndImageContainer";
import colors from "../utils/colors";
import BarChartRow from "./BarChartRow";
import type { InDataLists } from "../utils/processrawdata";
import InfoIcon from "@mui/icons-material/Info";
import CvaSectorsTooltip from "./CvaSectorsTooltip";
import constants from "../utils/constants";

type CvaChartProps = {
	data: DatumCvaTypes[];
	lists: List;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	year: number[];
	fund: number[];
	organizationType: number[];
	inDataLists: InDataLists;
};

const { unselectedCvaTypeOpacity } = constants;

function CvaChart({
	data,
	lists,
	clickedDownload,
	setClickedDownload,
	year,
	fund,
	organizationType,
	inDataLists,
}: CvaChartProps) {
	const { data: completeData } = useContext(DataContext) as DataContextType;

	const ref = useRef<HTMLDivElement>(null);

	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [tooltipData, setTooltipData] = useState<DatumCvaTypes | null>(null);
	const [cvaTypeClicked, setCvaTypeClicked] = useState<number | null>(null);

	const maxValue = max(
		data.map(d => Math.max(d.standard, d.reserve))
	) as number;

	const totalCva = sum(data, d => d.allocations);

	function handleDownloadClick() {
		const dataCvaTypesDownload = processCvaTypesDownload({
			data: completeData,
			lists,
			year,
			fund,
			organizationType,
		});
		downloadData<(typeof dataCvaTypesDownload)[number]>(
			dataCvaTypesDownload,
			"cva_types"
		);
	}

	function handleBarHover(
		event: React.MouseEvent<HTMLElement>,
		data: DatumCvaTypes
	) {
		setAnchorEl(event.currentTarget);
		setTooltipData(data);
	}

	function handleMouseLeave() {
		if (cvaTypeClicked === null) {
			setAnchorEl(null);
			setTooltipData(null);
		}
	}

	function handleClickCvaType(thisType: number) {
		if (cvaTypeClicked === null) {
			setCvaTypeClicked(thisType);
		}

		if (cvaTypeClicked && cvaTypeClicked === thisType) {
			setCvaTypeClicked(null);
		}
	}

	function handlePopoverCloseButton() {
		setAnchorEl(null);
		setTooltipData(null);
		setCvaTypeClicked(null);
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
				type={"funds"}
				refElement={ref}
				fileName={"funds"}
			/>
			<Box
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-around",
					height: "58px",
					flexDirection: "column",
				}}
				mb={2}
			>
				<Box
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexDirection: "row",
					}}
				>
					<Typography
						style={{
							fontSize: "1rem",
							fontWeight: 500,
							textTransform: "uppercase",
						}}
					>
						Allocations by CVA Type
						<InfoIcon
							data-tooltip-id="tooltip"
							data-tooltip-content={
								"Mouse over a CVA type for displaying the breakdown by sectors for that CVA type. For freezing the sectors' breakdown click on the CVA type, this allows you to hover over the sectors and getting detailed values. Click on the close icon for interacting again."
							}
							data-tooltip-place="top"
							style={{
								color: colors.unColor,
								fontSize: "20px",
								marginLeft: "0.1em",
								marginTop: "-0.4em",
								alignSelf: "flex-start",
								position: "absolute",
							}}
						/>
					</Typography>
				</Box>
				<Typography
					style={{
						fontSize: "0.8rem",
						display: "flex",
						alignItems: "center",
					}}
				>
					{"("}
					<span
						style={{
							width: "1em",
							height: "1em",
							backgroundColor: colors.standardColor,
							marginLeft: 5,
							marginRight: 5,
						}}
					/>
					Standard CVA allocations,
					<span
						style={{
							width: "1em",
							height: "1em",
							backgroundColor: colors.reserveColor,
							marginLeft: 5,
							marginRight: 5,
						}}
					/>
					Reserve CVA allocations
					{")"}
				</Typography>
			</Box>
			<Box
				display={"flex"}
				flexDirection={"row"}
				width={"95%"}
				marginLeft={"3%"}
				alignItems={"center"}
				justifyContent={"flex-start"}
				marginTop={2}
				marginBottom={3}
			>
				<Typography
					variant="body1"
					fontSize={13}
					style={{
						color: "#222",
						fontWeight: "bold",
						border: "none",
						paddingRight: "0.5em",
					}}
				>
					Selected funds:
				</Typography>
				<Typography
					variant="body2"
					fontSize={13}
					style={{
						color: "#222",
						border: "none",
						paddingRight: "0.5em",
					}}
				>
					{setFundsList(fund, lists, inDataLists)}
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
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "flex-end",
						textAlign: "center",
						width: "29%",
						alignSelf: "flex-start",
						marginBottom: "-1em",
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
						% of total
						<br />
						CVA
					</Typography>
				</Box>
				{data.map(d => (
					<Box
						key={d.cvaType}
						onMouseEnter={e => {
							if (cvaTypeClicked === null) {
								handleBarHover(e, d);
							}
						}}
						onMouseLeave={handleMouseLeave}
						onClick={() => handleClickCvaType(d.cvaType)}
						style={{
							width: "100%",
							display: "flex",
							opacity:
								cvaTypeClicked === null
									? 1
									: cvaTypeClicked === d.cvaType
									? 1
									: unselectedCvaTypeOpacity,
						}}
					>
						<BarChartRow
							key={d.cvaType}
							typeId={d.cvaType}
							valueA={d.standard}
							valueB={d.reserve}
							colorA={colors.standardColor}
							colorB={colors.reserveColor}
							maxValue={maxValue}
							listProperty={lists.cvaTypesAbbreviatedNames}
							chartType={"cvaTypes"}
							fromCva={true}
							totalCvaPercentage={
								totalCva === 0
									? 0
									: (d.allocations / totalCva) * 100
							}
						/>
					</Box>
				))}
			</Box>
			<CvaSectorsTooltip
				anchorEl={anchorEl}
				handleClose={handleMouseLeave}
				data={tooltipData}
				lists={lists}
				cvaTypeClicked={cvaTypeClicked}
				handlePopoverCloseButton={handlePopoverCloseButton}
			/>
		</Container>
	);
}

function setFundsList(
	fund: number[],
	lists: List,
	inDataLists: InDataLists
): string {
	return fund.length === inDataLists.funds.size
		? "all funds selected"
		: fund.reduce(function (acc, curr, index) {
				return (
					acc +
					(index >= fund.length - 2
						? index > fund.length - 2
							? lists.fundNames[curr]
							: lists.fundNames[curr] + " and "
						: lists.fundNames[curr] + ", ")
				);
		  }, "");
}

const MemoisedCvaChart = React.memo(CvaChart);

export default MemoisedCvaChart;
