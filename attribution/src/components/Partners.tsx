import React, { useState, useRef, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { List } from "../utils/makelists";
import { ascending, descending, sort } from "d3";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import { constants } from "../utils/constants";
import PartnersTableHead from "./PartnersTableHead";
import PartnersTableBody from "./PartnersTableBody";
import processDataSectors from "../utils/processdatasectors";
import SectorsRibbon from "./SectorsRibbon";
import InfoIcon from "@mui/icons-material/Info";
import type {
	AllocationsData,
	InAllocationsDataLists,
} from "../utils/processrawdata";
import processDataPartners, {
	type PartnersDatum,
} from "../utils/processdatapartners";

type PartnersProps = {
	allocationsData: AllocationsData;
	lists: List;
	funds: number[];
	year: number;
	inDataSectors: InAllocationsDataLists["sectorsPerYear"];
	attribution: number;
	donorName: string;
};

export type SortingCriterion = (typeof constants.partnersHeader)[number];

type SortingOrder = "asc" | "desc";

type SortAccessor = (e: PartnersDatum) => string | number;

function Partners({
	allocationsData,
	funds,
	year,
	lists,
	inDataSectors,
	attribution,
	donorName,
}: PartnersProps) {
	const [sortingCriterion, setSortingCriterion] =
			useState<SortingCriterion>("budget"),
		[sortingOrder, setSortingOrder] = useState<SortingOrder>("desc"),
		[sector, setSector] = useState<number[]>([...inDataSectors.get(year)!]);

	const { data, maxBudgetValue } = useMemo(
		() =>
			processDataPartners({
				allocationsData,
				funds,
				sector,
				year,
				globalAttribution: attribution,
			}),
		[allocationsData, funds, sector, year, attribution],
	);

	const dataSectors = useMemo(
		() =>
			processDataSectors({
				allocationsData,
				funds,
				setSector,
				globalAttribution: attribution,
			}),
		[allocationsData, funds, attribution],
	);

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

	return (
		<Box>
			<Grid
				container
				spacing={2}
			>
				<Grid
					size={12}
					sx={{
						marginBottom: 3,
					}}
				>
					<Typography
						style={{
							color: "var(--ocha-blue)",
							fontWeight: 700,
							marginBottom: "22px",
							textAlign: "center",
							fontSize: "2rem",
							fontFamily: "Montserrat",
						}}
					>
						Implementing Partners
					</Typography>
				</Grid>
			</Grid>
			<Box sx={{ display: "flex", marginBottom: 1 }}>
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
				attribution={attribution}
				donorName={donorName}
			/>
			<Box style={{ display: "flex", marginBottom: 1 }}>
				<Typography
					style={{
						fontSize: "0.9rem",
						color: "#666",
						fontWeight: 400,
					}}
				>
					Click on the headers for sorting. Click on a row for
					detailed sector information, and in the{" "}
					<span style={{ fontWeight: "bold" }}>Projects</span> column
					for detailed breakdown by project.
				</Typography>
			</Box>
			<Box sx={{ width: "100%", marginBottom: "42px" }}>
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
							attribution={attribution}
							donorName={donorName}
						/>
						<PartnersTableBody
							data={sortedData}
							maxBudgetValue={maxBudgetValue}
							lists={lists}
						/>
					</Table>
				</TableContainer>
				<Box
					sx={{
						width: "100%",
						height: "22px",
						backgroundColor: "#f3f3f3",
						borderTop: "1px solid #e0e0e0",
					}}
				></Box>
			</Box>
		</Box>
	);
}

const MemoisedPartners = React.memo(Partners);

export default MemoisedPartners;
