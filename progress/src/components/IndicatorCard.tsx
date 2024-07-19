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

type IndicatorCardProps = {
	datumIndicator: DatumIndicators;
	lists: List;
};

export type SortingOrder = "asc" | "desc";

type SortAccessor = (e: SectorDatum) => string | number;

function IndicatorCard({ datumIndicator, lists }: IndicatorCardProps) {
	const [sortingCriterion, setSortingCriterion] =
			useState<SortingCriterion>("indicator"),
		[sortingOrder, setSortingOrder] = useState<SortingOrder>("asc"),
		[showTotal, setShowTotal] = useState<boolean>(false);

	const sortMethod = sortingOrder === "asc" ? ascending : descending,
		sortAccessor: SortAccessor = e => {
			const criteriaMap = {
				indicator: lists.globalIndicators[e.indicatorId],
				outcome: e.outcome,
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

	return (
		<Paper
			elevation={0}
			style={{
				width: "100%",
				padding: "1em",
				backgroundColor: "#f3f3f3",
				borderRadius: "8px",
				position: "relative",
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
					<Box
						width="36px"
						height="36px"
					>
						<img
							src={clustersIconsData[datumIndicator.sector]}
							width="100%"
						/>
					</Box>
					<Typography
						variant="h6"
						style={{ marginLeft: "1em", fontSize: "1.4em" }}
					>
						{lists.sectors[datumIndicator.sector]}
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
					<TableContainer sx={{ maxHeight: 600 }}>
						<Table
							size="medium"
							stickyHeader
						>
							<IndicatorTableHead
								sortingCriterion={sortingCriterion}
								setSortingCriterion={setSortingCriterion}
								sortingOrder={sortingOrder}
								setSortingOrder={setSortingOrder}
							/>
							<IndicatorsTableBody
								data={sortedData}
								lists={lists}
								showTotal={showTotal}
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
