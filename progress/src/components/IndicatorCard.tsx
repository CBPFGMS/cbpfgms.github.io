import React, { useState } from "react";
import { List } from "../utils/makelists";
import { DatumIndicators } from "../utils/processdataindicators";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { clustersIconsData } from "../assets/clustericons";
import { ascending, descending, sort } from "d3";
import { SectorDatum } from "../utils/processdataindicators";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import IndicatorTableHead from "./IndicatorTableHead";
import { SortingCriterion } from "./IndicatorTableHead";
import IndicatorsTableBody from "./IndicatorTableBody";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";

type IndicatorCardProps = {
	datumIndicator: DatumIndicators;
	lists: List;
};

type IndicatorCardContentProps = {
	datumIndicator: DatumIndicators;
	lists: List;
	sortedData: SectorDatum[];
	sortingCriterion: SortingCriterion;
	setSortingCriterion: React.Dispatch<React.SetStateAction<SortingCriterion>>;
	sortingOrder: SortingOrder;
	setSortingOrder: React.Dispatch<React.SetStateAction<SortingOrder>>;
	showTotal: boolean;
	handleSwitchChange: () => void;
	expanded: boolean;
	toggleExpanded: () => void;
};

export type SortingOrder = "asc" | "desc";

type SortAccessor = (e: SectorDatum) => string | number;

function IndicatorCard({ datumIndicator, lists }: IndicatorCardProps) {
	const [sortingCriterion, setSortingCriterion] =
			useState<SortingCriterion>("indicator"),
		[sortingOrder, setSortingOrder] = useState<SortingOrder>("asc"),
		[showTotal, setShowTotal] = useState<boolean>(false),
		[expanded, setExpanded] = useState<boolean>(false);

	const sortMethod = sortingOrder === "asc" ? ascending : descending,
		sortAccessor: SortAccessor = e => {
			const criteriaMap = {
				indicator: lists.globalIndicators[e.indicatorId],
				projects: e.projects.size,
				targeted: e.targetedTotal,
				reached: e.reachedTotal,
			};
			return criteriaMap[sortingCriterion];
		};

	const sortedData = sort<SectorDatum>(datumIndicator.sectorData, (a, b) =>
		sortMethod(sortAccessor(a), sortAccessor(b))
	);

	function handleSwitchChange() {
		setShowTotal(!showTotal);
	}

	function toggleExpanded() {
		setExpanded(!expanded);
	}

	return (
		<>
			<Modal
				open={expanded}
				onClose={toggleExpanded}
			>
				<Box>
					<IndicatorCardContent
						datumIndicator={datumIndicator}
						lists={lists}
						sortedData={sortedData}
						sortingCriterion={sortingCriterion}
						setSortingCriterion={setSortingCriterion}
						sortingOrder={sortingOrder}
						setSortingOrder={setSortingOrder}
						showTotal={showTotal}
						handleSwitchChange={handleSwitchChange}
						expanded={expanded}
						toggleExpanded={toggleExpanded}
					/>
				</Box>
			</Modal>
			<IndicatorCardContent
				datumIndicator={datumIndicator}
				lists={lists}
				sortedData={sortedData}
				sortingCriterion={sortingCriterion}
				setSortingCriterion={setSortingCriterion}
				sortingOrder={sortingOrder}
				setSortingOrder={setSortingOrder}
				showTotal={showTotal}
				handleSwitchChange={handleSwitchChange}
				expanded={false}
				toggleExpanded={toggleExpanded}
			/>
		</>
	);
}

function IndicatorCardContent({
	datumIndicator,
	lists,
	sortedData,
	sortingCriterion,
	setSortingCriterion,
	sortingOrder,
	setSortingOrder,
	showTotal,
	handleSwitchChange,
	expanded,
	toggleExpanded,
}: IndicatorCardContentProps) {
	return (
		<Paper
			elevation={0}
			style={{
				width: expanded ? "90%" : "100%",
				position: expanded ? "absolute" : "relative",
				top: expanded ? "5%" : "0",
				left: expanded ? "5%" : "0",
				padding: "1em",
				backgroundColor: "#f3f3f3",
				borderRadius: "8px",
				maxHeight: expanded ? "90vh" : "",
				overflowY: "hidden",
				boxSizing: "border-box",
			}}
		>
			<Box
				display="flex"
				mb={2}
				flexDirection="column"
				overflow="hidden"
			>
				<Box
					display="flex"
					flexDirection="row"
					justifyContent="center"
					alignItems="center"
				>
					{datumIndicator.sector !== 0 && (
						<Box
							width="36px"
							height="36px"
						>
							<img
								src={clustersIconsData[datumIndicator.sector]}
								width="100%"
								height="100%"
							/>
						</Box>
					)}
					<Typography
						variant="h6"
						style={{
							marginLeft:
								datumIndicator.sector !== 0 ? "0.6em" : 0,
							fontSize: "1.4em",
						}}
					>
						{datumIndicator.sector === 0
							? "All Sectors"
							: lists.sectors[datumIndicator.sector]}
					</Typography>
					<Button
						onClick={toggleExpanded}
						style={{
							position: "absolute",
							right: "1em",
							top: "1em",
						}}
					>
						{expanded ? "Close" : "Expand"}
					</Button>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					justifyContent="center"
					mt={datumIndicator.sector !== 0 ? 0.5 : 0}
				>
					<Typography
						variant="body1"
						style={{
							fontSize: "1em",
							color: "#666",
						}}
					>
						From a total of {datumIndicator.totalProjects.size}{" "}
						project{datumIndicator.totalProjects.size > 1 && "s"}
					</Typography>
				</Box>
				<Box
					display="flex"
					flexDirection="row"
					alignItems="center"
					mt={1}
					mb={1}
				>
					<Switch
						checked={showTotal}
						onChange={handleSwitchChange}
						color="primary"
						size="small"
					/>
					<Typography
						sx={{
							color: showTotal ? "black" : "grey",
							cursor: "pointer",
							fontSize: "0.8em",
						}}
						onClick={handleSwitchChange}
					>
						Show Total
					</Typography>
				</Box>
				<Box sx={{ width: "100%	" }}>
					<TableContainer sx={{ maxHeight: expanded ? "80vh" : 600 }}>
						<Table
							size={expanded ? "small" : "medium"}
							stickyHeader
						>
							<IndicatorTableHead
								sortingCriterion={sortingCriterion}
								setSortingCriterion={setSortingCriterion}
								sortingOrder={sortingOrder}
								setSortingOrder={setSortingOrder}
								expanded={expanded}
								showTotal={showTotal}
								numberOfIndicators={
									datumIndicator.sectorData.length
								}
							/>
							<IndicatorsTableBody
								data={sortedData}
								lists={lists}
								showTotal={showTotal}
								expanded={expanded}
							/>
						</Table>
					</TableContainer>
				</Box>
			</Box>
		</Paper>
	);
}

const MemoizedIndicatorCard = React.memo(IndicatorCard);

export default MemoizedIndicatorCard;
