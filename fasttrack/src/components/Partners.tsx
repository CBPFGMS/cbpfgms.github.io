import React, { useState, useRef } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { PartnersDatum } from "../utils/processdatapartners";
import type { List } from "../utils/makelists";
// import type { DownloadStates } from "./MainContainer";
import { ascending, descending, sort } from "d3";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import { constants } from "../utils/constants";
import PartnersTableHead from "./PartnersTableHead";
import PartnersTableBody from "./PartnersTableBody";
import type { SectorsData } from "../utils/processdatasectors";
import SectorsRibbon from "./SectorsRibbon";
import InfoIcon from "@mui/icons-material/Info";

type PartnersProps = {
	data: PartnersDatum[];
	maxBudgetValue: number;
	lists: List;
	dataSectors: SectorsData;
	// clickedDownload: DownloadStates;
	// setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
};

export type SortingCriterion = (typeof constants.partnersHeader)[number];

type SortingOrder = "asc" | "desc";

type SortAccessor = (e: PartnersDatum) => string | number;

function Partners({
	data,
	maxBudgetValue,
	lists,
	dataSectors,
	// clickedDownload,
	// setClickedDownload,
}: PartnersProps) {
	const allSectors = dataSectors.sectors.map(d => d.sector);

	const [sortingCriterion, setSortingCriterion] =
			useState<SortingCriterion>("budget"),
		[sortingOrder, setSortingOrder] = useState<SortingOrder>("desc"),
		[sector, setSector] = useState<number[]>(allSectors);

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

	const filteredData: PartnersDatum[] = data.filter(d => {
		return [...d.sectors].some(d => sector.includes(d));
	});

	const sortedData = sort<PartnersDatum>(filteredData, (a, b) =>
		sortMethod(sortAccessor(a), sortAccessor(b)),
	);

	const tableRef = useRef(null);

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
			<Box
				style={{ display: "flex" }}
				mb={1}
			>
				<Typography
					style={{
						fontSize: "0.9rem",
						color: "#666",
						fontWeight: 400,
					}}
				>
					Filter by sector
				</Typography>
				<InfoIcon
					data-tooltip-id="tooltip"
					data-tooltip-content="For partners with several sectors, you must unselect all sectors for filtering them out"
					data-tooltip-place="top"
					style={{
						color: "#666",
						fontSize: "16px",
						marginLeft: "0.1em",
						alignSelf: "flex-start",
						marginTop: "-0.1em",
					}}
				/>
			</Box>
			<SectorsRibbon
				dataSectors={dataSectors}
				lists={lists}
				sector={sector}
				setSector={setSector}
			/>
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
						/>
					</Table>
				</TableContainer>
			</Box>
		</Box>
	);
}

const MemoisedPartners = React.memo(Partners);

export default MemoisedPartners;
