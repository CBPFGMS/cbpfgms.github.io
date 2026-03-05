import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { constants } from "../utils/constants";
import type { SortingOrder } from "./IndicatorCard";
import Box from "@mui/material/Box";
import type { SortingCriterion } from "./Partners";
import colors from "../utils/colors";

type PartnersTableHeadProps = {
	sortingCriterion: SortingCriterion;
	setSortingCriterion: React.Dispatch<React.SetStateAction<SortingCriterion>>;
	sortingOrder: SortingOrder;
	setSortingOrder: React.Dispatch<React.SetStateAction<SortingOrder>>;
};

type Titles = {
	[K in (typeof partnersHeader)[number]]: string;
};

const { partnersHeader, columnWidthsPartnersHeader } = constants;

function PartnersTableHead({
	setSortingCriterion,
	setSortingOrder,
	sortingCriterion,
	sortingOrder,
}: PartnersTableHeadProps) {
	const titles: Titles = {
		partner: "Organization Name",
		sector: "Sectors",
		budget: "Approved Amount, in USD",
		projects: "# of Projects",
		funds: "# of CBPFs",
	};

	function handleClick(header: SortingCriterion) {
		if (sortingCriterion === header) {
			setSortingOrder(sortingOrder === "asc" ? "desc" : "asc");
		} else {
			setSortingCriterion(header);
			setSortingOrder(sortingCriterion === "partner" ? "asc" : "desc");
		}
	}

	return (
		<TableHead>
			<TableRow>
				{partnersHeader.map((header, index) => (
					<TableCell
						key={header}
						style={{
							width: columnWidthsPartnersHeader[index],
							fontSize: "1em",
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
								height: "100%",
								alignItems: "center",
								justifyContent:
									header === "partner" || header === "budget"
										? "flex-start"
										: "center",
							}}
						>
							<TableSortLabel
								active={sortingCriterion === header}
								direction={
									sortingCriterion === header
										? sortingOrder
										: "desc"
								}
								sx={{
									"&.Mui-active": {
										color:
											header === sortingCriterion
												? colors.unColor
												: null,
										fontWeight:
											header === sortingCriterion
												? 900
												: null,
									},
								}}
							>
								{titles[header]}
							</TableSortLabel>
						</Box>
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

export default PartnersTableHead;
