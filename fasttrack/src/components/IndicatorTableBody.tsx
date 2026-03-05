import Box from "@mui/material/Box";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import type { SectorDatum } from "../utils/processdataindicators";
import type { List } from "../utils/makelists";
import { constants } from "../utils/constants";
import Pictogram from "../assets/Pictogram";
import colors from "../utils/colors";
import capitalizeString from "../utils/capitalizestring";
import Typography from "@mui/material/Typography";
import { format } from "d3";
import type { PictogramTypesWithTotal } from "../assets/Pictogram";
import type { VirtualItem } from "@tanstack/react-virtual";

type IndicatorsTableBodyProps = {
	data: SectorDatum[];
	lists: List;
	showTotal: boolean;
	expanded: boolean;
	virtualRows: VirtualItem[];
	totalSize: number;
	measureRef: (el: Element | null) => void;
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

function IndicatorsTableBody({
	data,
	lists,
	showTotal,
	expanded,
	virtualRows,
	totalSize,
	measureRef,
}: IndicatorsTableBodyProps) {
	return (
		<TableBody
			style={{
				height: `${totalSize}px`, // Total height for scrollbar
				position: "relative",
			}}
		>
			{virtualRows.map(virtualRow => {
				const row = data[virtualRow.index];
				return (
					<TableRow
						key={virtualRow.index}
						data-index={virtualRow.index}
						ref={measureRef}
						hover
						style={{
							position: "absolute",
							top: 0,
							transform: `translateY(${virtualRow.start}px)`,
							width: "100%",
							display: "flex",
						}}
					>
						{indicatorsHeader.map((header, index) => {
							if (header === "indicator") {
								return (
									<TableCell
										key={index}
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
				);
			})}
		</TableBody>
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
