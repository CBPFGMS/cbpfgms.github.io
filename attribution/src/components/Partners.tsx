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
import { constants } from "../utils/constants";
import PartnersTableHead from "./PartnersTableHead";
import PartnersTableBody from "./PartnersTableBody";
import type { SectorsData } from "../utils/processdatasectors";
import SectorsRibbon from "./SectorsRibbon";
import InfoIcon from "@mui/icons-material/Info";
import DownloadAndImageContainer from "./DownloadAndImageContainer";
import type { PartnersDatumDownload } from "../utils/processdownload";
import downloadData from "../utils/downloaddata";

type PartnersProps = {
	data: PartnersDatum[];
	maxBudgetValue: number;
	lists: List;
	dataSectors: SectorsData;
	sector: number[];
	setSector: React.Dispatch<React.SetStateAction<number[]>>;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	dataPartnersDownload: () => PartnersDatumDownload[];
};

export type SortingCriterion = (typeof constants.partnersHeader)[number];

type SortingOrder = "asc" | "desc";

type SortAccessor = (e: PartnersDatum) => string | number;

function Partners({
	data,
	maxBudgetValue,
	lists,
	dataSectors,
	sector,
	setSector,
	clickedDownload,
	setClickedDownload,
	dataPartnersDownload,
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

	const ref = useRef<HTMLDivElement>(null);

	function handleDownloadClick() {
		const dataPartners = dataPartnersDownload();
		downloadData<(typeof dataPartners)[number]>(
			dataPartners,
			"implementing_partners",
		);
	}

	return (
		<Box ref={ref}>
			<Grid
				container
				spacing={2}
				position={"relative"}
			>
				<DownloadAndImageContainer
					handleDownloadClick={handleDownloadClick}
					clickedDownload={clickedDownload}
					setClickedDownload={setClickedDownload}
					type="partners"
					refElement={ref}
					fileName="Implementing_Partners"
				/>
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
					Click on the headers for sorting. Click on a row for
					detailed sector information, and in the{" "}
					<span style={{ fontWeight: "bold" }}>Projects</span> column
					for detailed breakdown by project.
				</Typography>
			</Box>
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
