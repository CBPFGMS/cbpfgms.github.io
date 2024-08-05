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

const { indicatorsHeader, beneficiaryCategories } = constants;

const pictogramWidth = 12;

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
									{header === "indicator"
										? lists.globalIndicators[
												row.indicatorId
										  ]
										: row.outcome}
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
			{row.unit === "p"
				? `${Math.ceil(thisValue * 100)}%`
				: thisValue.toLocaleString()}
		</TableCell>
	);
}

function CellBeneficiariesBreakdown({
	row,
	header,
	expanded,
}: CellValuesProps) {
	return (
		<TableCell>
			<Box
				style={{
					width: expanded ? "100%" : "90%",
					display: "flex",
					flexDirection: expanded ? "row" : "column",
				}}
			>
				{beneficiaryCategories.map((category, index) => (
					<Box
						key={index}
						style={{
							width: "100%",
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
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
								justifyContent: expanded
									? "flex-start"
									: "flex-end",
								paddingLeft: expanded ? "2px" : "6px",
							}}
						>
							{row.unit === "p"
								? `${Math.ceil(row[header][category] * 100)}%`
								: row[header][category].toLocaleString()}
						</Box>
					</Box>
				))}
			</Box>
		</TableCell>
	);
}

export default IndicatorsTableBody;
