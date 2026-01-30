import Box from "@mui/material/Box";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { SectorDatum } from "../utils/processdataindicators";
import { List } from "../utils/makelists";
import constants from "../utils/constants";
import Pictogram from "../assets/Pictogram";
import colors from "../utils/colors";
import capitalizeString from "../utils/capitalizestring";
import Typography from "@mui/material/Typography";
import { format } from "d3";
import { PictogramTypesWithTotal } from "../assets/Pictogram";

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
};

type CellRowProps = CellValuesProps & {
	category: PictogramTypesWithTotal;
	cellIndex?: number;
};

const { indicatorsHeader, beneficiaryCategories } = constants;

const pictogramWidth = 12;

const percentFormat = format(".1~f");

function IndicatorsTableBody({
	data,
	lists,
	showTotal,
	expanded,
}: IndicatorsTableBodyProps) {
	return (
		<TableBody>
			{data.map((row, index) => (
				<TableRow
					key={index}
					hover
				>
					{indicatorsHeader.map((header, index) => {
						if (header === "indicator") {
							return (
								<TableCell key={index}>
									{lists.globalIndicators[row.indicatorId]}
								</TableCell>
							);
						} else if (header === "projects") {
							return (
								<TableCell
									key={index}
									align="center"
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
								/>
							) : (
								<CellBeneficiariesBreakdown
									key={index}
									row={row}
									header={header}
									expanded={expanded}
								/>
							);
						}
					})}
				</TableRow>
			))}
		</TableBody>
	);
}

function CellValues({ row, header }: CellValuesProps) {
	const { targetedTotal, reachedTotal } = row;
	const thisValue = header === "targeted" ? targetedTotal : reachedTotal;
	return (
		<TableCell align="right">
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
}: CellValuesProps) {
	const hasNoData = beneficiaryCategories.every(
		category => row[header][category] === null
	);

	let cellIndex = 0;

	return (
		<TableCell>
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
						)
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
