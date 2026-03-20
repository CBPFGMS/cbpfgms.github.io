import React, { useState } from "react"; // Added useState
import Box from "@mui/material/Box";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Modal from "@mui/material/Modal"; // Added Modal
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close"; // You may need to install @mui/icons-material
import type { SectorDatum } from "../utils/processdataindicators";
import type { List } from "../utils/makelists";
import { constants } from "../utils/constants";
import Pictogram from "../assets/Pictogram";
import colors from "../utils/colors";
import capitalizeString from "../utils/capitalizestring";
import { format } from "d3";
import type { PictogramTypesWithTotal } from "../assets/Pictogram";

type IndicatorsTableBodyProps = {
	data: SectorDatum[];
	lists: List;
	showTotal: boolean;
	expanded: boolean;
};

type CellValuesProps = {
	row: SectorDatum;
	header: "targeted" | "reached";
	expanded?: boolean;
	index: number;
};

type CellRowProps = Omit<CellValuesProps, "index"> & {
	category: PictogramTypesWithTotal;
	cellIndex?: number;
};

const {
	indicatorsHeader,
	beneficiaryCategories,
	columnWidths,
	columnWidthsExpanded,
} = constants;

const pictogramWidth = 12;

const percentFormat = format(".1~f");

const modalStyle = {
	position: "absolute" as const,
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: "100%",
	maxWidth: 900,
	maxHeight: "70vh",
	bgcolor: "background.paper",
	boxShadow: 24,
	p: 4,
	borderRadius: 2,
	outline: "none",
	display: "flex",
	flexDirection: "column",
	overflow: "hidden",
};

function IndicatorsTableBody({
	data,
	lists,
	showTotal,
	expanded,
}: IndicatorsTableBodyProps) {
	// State for Modal
	const [selectedRow, setSelectedRow] = useState<SectorDatum | null>(null);

	// const handleRowClick = (row: SectorDatum) => {
	// 	setSelectedRow(row);
	// };

	const handleClose = () => {
		setSelectedRow(null);
	};

	return (
		<>
			<TableBody>
				{data.map((row, index) => (
					<TableRow
						key={index}
						hover
						//onClick={() => handleRowClick(row)} // ADD LATER!!!
						style={{ cursor: "pointer" }}
					>
						{indicatorsHeader.map((header, index) => {
							if (header === "indicator") {
								return (
									<TableCell
										key={index}
										style={{
											width:
												expanded && !showTotal
													? columnWidthsExpanded[
															index
														]
													: columnWidths[index],
										}}
									>
										{
											lists.globalIndicators[
												row.indicatorId
											]
										}
									</TableCell>
								);
							} else if (header === "projects") {
								return (
									<TableCell
										key={index}
										align="center"
										style={{
											cursor: "pointer",
											width:
												expanded && !showTotal
													? columnWidthsExpanded[
															index
														]
													: columnWidths[index],
										}}
									>
										{row.projects.size.toLocaleString()}
									</TableCell>
								);
							} else {
								return showTotal ? (
									<CellValues
										key={index}
										row={row}
										header={header}
										index={index}
									/>
								) : (
									<CellBeneficiariesBreakdown
										key={index}
										row={row}
										header={header}
										expanded={expanded}
										index={index}
									/>
								);
							}
						})}
					</TableRow>
				))}
			</TableBody>
			{/* Modal Implementation */}
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
									{selectedRow
										? lists.globalIndicators[
												selectedRow.indicatorId
											]
										: ""}
								</Typography>
							</Box>
							<IconButton onClick={handleClose}>
								<CloseIcon />
							</IconButton>
						</Box>
						<Typography
							variant="body1"
							sx={{ mb: 2 }}
						>
							Detailed Metrics
						</Typography>
						<Box
							sx={{
								overflowY: "auto", // This activates the scroll
								flexGrow: 1, // This forces it to take up the remaining 70vh
								background: "#fdfdfd",
								pr: 1, // Extra padding for the scrollbar gutter
							}}
						>
							{/* Simulated long content */}
							<div
								style={{
									height: "1000px",
									background: "#f5f5f5",
									padding: "20px",
									borderRadius: "8px",
								}}
							>
								<Typography
									variant="body2"
									color="textSecondary"
								>
									Success! The title stays at the top, and
									this gray area scrolls within the{" "}
									{modalStyle.maxHeight} limit.
								</Typography>
							</div>
						</Box>
					</Box>
				</Fade>
			</Modal>
		</>
	);
}

function CellValues({ row, header, index }: CellValuesProps) {
	const { targetedTotal, reachedTotal } = row;
	const thisValue = header === "targeted" ? targetedTotal : reachedTotal;
	return (
		<TableCell
			align="right"
			style={{
				cursor: "pointer",
				width: columnWidths[index],
			}}
		>
			{row.unit === "%"
				? percentFormat(thisValue) + "%"
				: thisValue.toLocaleString()}
		</TableCell>
	);
}

function CellBeneficiariesBreakdown({
	row,
	header,
	expanded,
	index,
}: CellValuesProps) {
	const hasNoData = beneficiaryCategories.every(
		category => row[header][category] === null,
	);

	let cellIndex = 0;

	return (
		<TableCell
			style={{
				cursor: "pointer",
				width: expanded
					? columnWidthsExpanded[index]
					: columnWidths[index],
			}}
		>
			<Box
				style={{
					width: expanded ? "100%" : "90%",
					display: "flex",
					flexDirection: expanded ? "row" : "column",
				}}
			>
				{hasNoData ? (
					<CellRow
						row={row}
						header={header}
						expanded={expanded}
						category="total"
					/>
				) : (
					beneficiaryCategories.map((category, index) =>
						row[header][category] === null ? null : (
							<CellRow
								key={index}
								row={row}
								header={header}
								expanded={expanded}
								category={category}
								cellIndex={cellIndex++}
							/>
						),
					)
				)}
			</Box>
		</TableCell>
	);
}

function CellRow({ row, header, expanded, category, cellIndex }: CellRowProps) {
	return (
		<Box
			style={{
				width: "100%",
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				borderTop:
					cellIndex && !expanded ? "1px solid #e2e2e2" : "none",
			}}
		>
			<Box
				style={{
					flex: "0 60%",
					display: "flex",
					justifyContent: "flex-end",
					alignItems: "center",
					paddingRight: expanded ? "2px" : "6px",
				}}
			>
				<Pictogram
					svgProps={{
						style: {
							width: pictogramWidth,
							fill:
								header === "targeted"
									? colors.contrastColor
									: colors.unColor,
							paddingRight: "4px",
						},
					}}
					type={category}
				/>
				<Typography
					variant="body2"
					style={{
						fontSize: 12,
						color: "#444",
						whiteSpace: "pre",
					}}
				>
					{`${capitalizeString(category)}: `}
				</Typography>
			</Box>
			<Box
				style={{
					flex: "0 40%",
					display: "flex",
					justifyContent: expanded ? "flex-start" : "flex-end",
					paddingLeft: expanded ? "2px" : "6px",
				}}
			>
				{row.unit === "%"
					? (category === "total"
							? percentFormat(row[`${header}Total`])
							: percentFormat(row[header][category]!)) + "%"
					: category === "total"
						? row[`${header}Total`].toLocaleString()
						: row[header][category]!.toLocaleString()}
			</Box>
		</Box>
	);
}

export default IndicatorsTableBody;
