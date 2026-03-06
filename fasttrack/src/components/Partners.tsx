import React, { useState, useRef } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { PartnersDatum } from "../utils/processdatapartners";
import type { List } from "../utils/makelists";
import type { DownloadStates } from "./MainContainer";
import { ascending, descending, sort } from "d3";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import { useVirtualizer } from "@tanstack/react-virtual";
import { constants } from "../utils/constants";
import PartnersTableHead from "./PartnersTableHead";
import PartnersTableBody from "./PartnersTableBody";

type PartnersProps = {
	data: PartnersDatum[];
	maxBudgetValue: number;
	lists: List;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
};

export type SortingCriterion = (typeof constants.partnersHeader)[number];

type SortingOrder = "asc" | "desc";

type SortAccessor = (e: PartnersDatum) => string | number;

function Partners({
	data,
	maxBudgetValue,
	lists,
	clickedDownload,
	setClickedDownload,
}: PartnersProps) {
	const [sortingCriterion, setSortingCriterion] =
			useState<SortingCriterion>("budget"),
		[sortingOrder, setSortingOrder] = useState<SortingOrder>("desc");

	const sortMethod = sortingOrder === "asc" ? ascending : descending,
		sortAccessor: SortAccessor = e => {
			const criteriaMap = {
				partner: lists.organizations[e.partner],
				projects: e.projects.size,
				budget: e.budget,
				funds: e.funds.size,
				sector: e.sectors.size,
			};
			return criteriaMap[sortingCriterion];
		};

	const sortedData = sort<PartnersDatum>(data, (a, b) =>
		sortMethod(sortAccessor(a), sortAccessor(b)),
	);

	const tableRef = useRef(null);

	const rowVirtualizer = useVirtualizer({
		count: sortedData.length,
		getScrollElement: () => tableRef.current,
		estimateSize: () => 53, // Average height of an MUI row
		measureElement: el => el.getBoundingClientRect().height,
		overscan: 5, // Number of rows to render outside the view
	});

	const virtualRows = rowVirtualizer.getVirtualItems();

	const totalSize = rowVirtualizer.getTotalSize();

	return (
		<Box>
			<Grid
				container
				spacing={2}
				position={"relative"}
			>
				<Grid
					size={12}
					mb={3}
				>
					<Typography
						style={{
							color: "var(--ocha-blue)",
							fontWeight: 700,
							margin: "30px 0 22px 0",
							textAlign: "center",
							fontSize: "2rem",
							fontFamily: "Montserrat",
						}}
					>
						Implementing Partners
					</Typography>
				</Grid>
			</Grid>
			<Box sx={{ width: "100%	", borderBottom: "1px solid #aaa" }}>
				<TableContainer
					ref={tableRef}
					sx={{
						maxHeight: 800,
						overflow: "auto",
					}}
				>
					<Table
						size={"medium"}
						stickyHeader
					>
						<PartnersTableHead
							setSortingCriterion={setSortingCriterion}
							sortingCriterion={sortingCriterion}
							setSortingOrder={setSortingOrder}
							sortingOrder={sortingOrder}
						/>
						<PartnersTableBody
							data={sortedData}
							maxBudgetValue={maxBudgetValue}
							lists={lists}
							virtualRows={virtualRows}
							totalSize={totalSize}
							measureRef={rowVirtualizer.measureElement}
						/>
					</Table>
				</TableContainer>
			</Box>
		</Box>
	);
}

const MemoisedPartners = React.memo(Partners);

export default MemoisedPartners;
