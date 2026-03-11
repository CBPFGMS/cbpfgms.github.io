import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import type { PartnersDatum } from "../utils/processdatapartners";
import type { List } from "../utils/makelists";
import { constants } from "../utils/constants";
import Typography from "@mui/material/Typography";
import { clustersIconsData } from "../assets/clustericons";
import colors from "../utils/colors";
import formatSIFloat from "../utils/formatsi";

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

const {
	partnersHeader,
	columnWidthsPartners,
	partnerBarHeight,
	partnerBarMaxWidth,
} = constants;

const sectorIconWidth = 26;

function PartnersTableBody({
	data,
	maxBudgetValue,
	lists,
}: PartnersTableBodyProps) {
	return (
		<TableBody>
			{data.map((row, index) => {
				const tooltipFundTitle = row.funds.size > 1 ? "Funds" : "Fund";
				const tooltipFunds = [...row.funds]
					.map(d => lists.fundNames[d])
					.join(", ");
				const tooltipFundText = `<div style='text-align:center;'><span style='font-weight:bold'>${tooltipFundTitle}: </span>${tooltipFunds}</div>`;
				return (
					<TableRow
						key={index}
						hover
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
											? lists.organizations[row[header]]
											: row[header].size}
									</TableCell>
								);
							}
						})}
					</TableRow>
				);
			})}
		</TableBody>
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
								padding: "4px",
								filter: "brightness(0) invert(1)",
							}}
						/>
					</Box>
				))}
			</Box>
		</TableCell>
	);
}

export default PartnersTableBody;
