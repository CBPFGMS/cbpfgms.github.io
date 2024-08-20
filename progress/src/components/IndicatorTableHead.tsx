import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import constants from "../utils/constants";
import { SortingOrder } from "./IndicatorCard";
import capitalizeString from "../utils/capitalizestring";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import { Box } from "@mui/material";
import colors from "../utils/colors";
import InfoIcon from "@mui/icons-material/Info";

export type SortingCriterion = (typeof indicatorsHeader)[number];

type IndicatorTableHeadProps = {
	sortingCriterion: SortingCriterion;
	setSortingCriterion: React.Dispatch<React.SetStateAction<SortingCriterion>>;
	sortingOrder: SortingOrder;
	setSortingOrder: React.Dispatch<React.SetStateAction<SortingOrder>>;
	expanded: boolean;
	showTotal: boolean;
	numberOfIndicators: number;
};

const { indicatorsHeader, columnWidths, columnWidthsExpanded } = constants;

function IndicatorTableHead({
	setSortingCriterion,
	setSortingOrder,
	sortingCriterion,
	sortingOrder,
	expanded,
	showTotal,
	numberOfIndicators,
}: IndicatorTableHeadProps) {
	function handleClick(header: SortingCriterion) {
		if (sortingCriterion === header) {
			setSortingOrder(sortingOrder === "asc" ? "desc" : "asc");
		} else {
			setSortingCriterion(header);
			setSortingOrder(sortingCriterion === "indicator" ? "asc" : "desc");
		}
	}

	return (
		<TableHead>
			<TableRow>
				{indicatorsHeader.map((header, index) => (
					<TableCell
						key={header}
						style={{
							cursor: "pointer",
							width:
								expanded && !showTotal
									? columnWidthsExpanded[index]
									: columnWidths[index],
						}}
						sx={{ backgroundColor: "#f3f3f3" }}
						onClick={() => handleClick(header)}
						sortDirection={
							sortingCriterion === header ? sortingOrder : "desc"
						}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent:
									header === "reached" ||
									header === "targeted"
										? expanded
											? "center"
											: "flex-end"
										: "flex-start",
							}}
						>
							{header === "targeted" && (
								<AdsClickIcon
									style={{
										fontSize: 18,
										marginRight: 4,
										color: "#777",
										opacity: 0.6,
									}}
								/>
							)}
							{header === "reached" && (
								<DoneIcon
									style={{
										fontSize: 18,
										marginRight: 4,
										color: "#777",
										opacity: 0.6,
									}}
								/>
							)}
							<TableSortLabel
								active={sortingCriterion === header}
								direction={
									sortingCriterion === header
										? sortingOrder
										: "desc"
								}
								sx={{
									color:
										header === "targeted"
											? colors.contrastColorDarker
											: header === "reached"
											? colors.unColor
											: null,
								}}
								//onClick={createSortHandler(headCell.id)} MAYBE NEEDED?
							>
								{header === "projects" ? (
									<Box
										style={{
											display: "flex",
											alignItems: "center",
										}}
									>
										Projects
										<InfoIcon
											data-tooltip-id="tooltip"
											data-tooltip-content={
												"Number of projects mapped to the indicator"
											}
											data-tooltip-place="top"
											style={{
												color: "#666",
												fontSize: "16px",
												marginLeft: "0.1em",
												marginTop: "-0.6em",
											}}
										/>
									</Box>
								) : (
									capitalizeString(header) +
									(header === "indicator"
										? `${
												numberOfIndicators > 1
													? "s"
													: ""
										  } (${numberOfIndicators})`
										: "")
								)}
							</TableSortLabel>
						</Box>
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

export default IndicatorTableHead;
