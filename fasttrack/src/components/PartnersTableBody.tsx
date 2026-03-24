import { useState } from "react";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Paper from "@mui/material/Paper";
import type { PartnersDatum } from "../utils/processdatapartners";
import type { List } from "../utils/makelists";
import { constants } from "../utils/constants";
import Typography from "@mui/material/Typography";
import { clustersIconsData } from "../assets/clustericons";
import colors from "../utils/colors";
import formatSIFloat from "../utils/formatsi";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";

type PartnersTableBodyProps = {
	data: PartnersDatum[];
	maxBudgetValue: number;
	lists: List;
};

type BudgetCellProps = {
	index: number;
	row: PartnersDatum;
	maxBudgetValue: number;
};

type SectorCellProps = {
	index: number;
	row: PartnersDatum;
	lists: List;
};

type RowModalProps = {
	selectedRow: PartnersDatum;
	lists: List;
	handleClose: () => void;
};

const {
	partnersHeader,
	columnWidthsPartners,
	partnerBarHeight,
	partnerBarMaxWidth,
} = constants;

const sectorIconWidth = 26;

const modalStyle = {
	position: "absolute" as const,
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: "100%",
	maxWidth: 900,
	bgcolor: "background.paper",
	boxShadow: 24,
	p: 4,
	borderRadius: 2,
	outline: "none",
	display: "flex",
	flexDirection: "column",
};

function PartnersTableBody({
	data,
	maxBudgetValue,
	lists,
}: PartnersTableBodyProps) {
	const [selectedRow, setSelectedRow] = useState<PartnersDatum | null>(null);

	const handleRowClick = (row: PartnersDatum) => {
		setSelectedRow(row);
	};

	const handleClose = () => {
		setSelectedRow(null);
	};

	return (
		<>
			<TableBody>
				{data.map((row, index) => {
					const tooltipFundTitle =
						row.funds.size > 1 ? "Funds" : "Fund";
					const tooltipFunds = [...row.funds]
						.map(d => lists.fundNames[d])
						.join(", ");
					const tooltipFundText = `<div style='text-align:center;'><span style='font-weight:bold'>${tooltipFundTitle}: </span>${tooltipFunds}</div>`;
					return (
						<TableRow
							key={index}
							hover
							onClick={() => handleRowClick(row)}
							style={{ cursor: "pointer" }}
							// style={{
							// 	position: "absolute",
							// 	top: 0,
							// 	transform: `translateY(${virtualRow.start}px)`,
							// 	width: "100%",
							// 	display: "flex",
							// }}
						>
							{partnersHeader.map((header, indexCell) => {
								if (header === "budget") {
									return (
										<BudgetCell
											key={`${index}-${indexCell}`}
											row={row}
											index={indexCell}
											maxBudgetValue={maxBudgetValue}
										/>
									);
								} else if (header === "sector") {
									return (
										<SectorCell
											key={`${index}-${indexCell}`}
											row={row}
											index={indexCell}
											lists={lists}
										/>
									);
								} else {
									return (
										<TableCell
											key={`${index}-${indexCell}`}
											align={
												header === "partner"
													? "left"
													: "center"
											}
											style={{
												color: "#333",
												fontFamily: "Montserrat",
												fontSize: "16px",
												fontWeight: 500,
											}}
											{...(header === "funds" && {
												"data-tooltip-id": "tooltip",
												"data-tooltip-html":
													tooltipFundText,
												"data-tooltip-place": "top",
											})}
										>
											{header === "partner"
												? lists.organizations[
														row[header]
													]
												: row[header].size}
										</TableCell>
									);
								}
							})}
						</TableRow>
					);
				})}
			</TableBody>
			{selectedRow && (
				<RowModal
					selectedRow={selectedRow}
					lists={lists}
					handleClose={handleClose}
				/>
			)}
		</>
	);
}

function BudgetCell({ row, maxBudgetValue, index }: BudgetCellProps) {
	const barWidth = Math.round(
		(row.budget / maxBudgetValue) * partnerBarMaxWidth,
	);
	return (
		<TableCell
			key={index}
			align="left"
			style={{ width: columnWidthsPartners[index] }}
			data-tooltip-id="tooltip"
			data-tooltip-html={"$" + row.budget.toLocaleString()}
			data-tooltip-place="top"
		>
			<Box
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
				}}
			>
				<Box
					style={{
						width: barWidth + "%",
						height: partnerBarHeight,
						backgroundColor: colors.unColor,
					}}
				></Box>
				<Typography
					style={{
						paddingLeft: "6px",
						color: "#333",
						fontFamily: "Montserrat",
						fontSize: "16px",
						fontWeight: 600,
					}}
				>
					{formatSIFloat(row.budget)}
				</Typography>
			</Box>
		</TableCell>
	);
}

function SectorCell({ row, index, lists }: SectorCellProps) {
	const tooltipTitle = row.sectors.size > 1 ? "Sectors" : "Sector";
	const tooltipSectors = [...row.sectors]
		.map(d => lists.sectors[d])
		.join(", ");
	const tooltipText = `<div style='text-align:center;'><span style='font-weight:bold'>${tooltipTitle}: </span>${tooltipSectors}</div>`;
	return (
		<TableCell
			key={index}
			align="center"
			style={{ width: columnWidthsPartners[index] }}
			data-tooltip-id="tooltip"
			data-tooltip-html={tooltipText}
			data-tooltip-place="top"
		>
			<Box
				style={{
					width: "100%",
					display: "flex",
					flexDirection: "row",
					justifyContent: "center",
					flexWrap: "wrap",
				}}
			>
				{[...row.sectors].map(d => (
					<Box
						key={d}
						style={{
							width: sectorIconWidth + "px",
							height: sectorIconWidth + "px",
							background: "#146eb4",
							borderRadius: "50%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "white",
							fontSize: "1.5rem",
							flexShrink: "0",
							margin: "2px",
						}}
					>
						<img
							src={clustersIconsData[d]}
							width={"50%"}
							height={"50%"}
							style={{
								filter: "brightness(0) invert(1)",
							}}
						/>
					</Box>
				))}
			</Box>
		</TableCell>
	);
}

function RowModal({ selectedRow, lists, handleClose }: RowModalProps) {
	const sortedRow = selectedRow.sectorsDetails
		.slice()
		.sort((a, b) => b.budget - a.budget);
	return (
		<Modal
			open={Boolean(selectedRow)}
			onClose={handleClose}
			closeAfterTransition
			slots={{ backdrop: Backdrop }}
			slotProps={{
				backdrop: {
					timeout: 500,
				},
			}}
		>
			<Fade in={Boolean(selectedRow)}>
				<Box sx={modalStyle}>
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
						mb={2}
					>
						<Box
							display="flex"
							flexDirection="column"
						>
							<Typography>Indicator:</Typography>
							<Typography variant="h6">
								List of Sectors:
							</Typography>
						</Box>
						<IconButton onClick={handleClose}>
							<CloseIcon />
						</IconButton>
					</Box>
					<Paper sx={{ width: "100%", overflow: "hidden" }}>
						<TableContainer
							sx={{
								maxHeight: "50vh",
							}}
						>
							<Table
								stickyHeader
								aria-label="project data table"
							>
								<TableHead>
									<TableRow>
										<TableCell>Project Code</TableCell>
										<TableCell>Sector</TableCell>
										<TableCell>Fund</TableCell>
										<TableCell align="right">
											Budget
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{sortedRow.map((row, index) => {
										const thisProjectName =
											lists.projectDetails.get(
												row.project,
											);
										return (
											<TableRow
												hover
												key={`${row}-${index}`}
												sx={{
													"&:last-child td, &:last-child th":
														{
															border: 0,
														},
												}}
											>
												<TableCell
													component="th"
													scope="row"
												>
													{thisProjectName
														? thisProjectName.projectName
														: "Unspecified Project"}
												</TableCell>
												<TableCell
													component="th"
													scope="row"
												>
													{lists.sectors[row.sector]}
												</TableCell>
												<TableCell>
													{lists.fundNames[row.fund]}
												</TableCell>
												<TableCell align="right">
													{"$" +
														Math.floor(
															row.budget,
														).toLocaleString()}
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</TableContainer>
					</Paper>
				</Box>
			</Fade>
		</Modal>
	);
}

export default PartnersTableBody;
