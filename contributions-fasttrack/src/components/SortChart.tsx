import Box from "@mui/material/Box";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import type { SortBy, SortOrder } from "./Chart";
import ToggleButton from "@mui/material/ToggleButton";
import NorthIcon from "@mui/icons-material/North";
import { constants } from "../utils/constants";

type SortChartProps = {
	sortBy: SortBy;
	sortOrder: SortOrder;
	handleChangeSortBy: (
		event: React.MouseEvent<HTMLElement, MouseEvent>,
		value: SortBy | null,
	) => void;
};

const { sortByOptions } = constants;

function SortChart({ sortBy, sortOrder, handleChangeSortBy }: SortChartProps) {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "flex-start",
				alignItems: "center",
				flexDirection: "row",
			}}
		>
			<Typography
				variant="body1"
				sx={{ fontWeight: 400, color: "#333" }}
			>
				Sort by:
			</Typography>
			<ToggleButtonGroup
				value={sortBy}
				exclusive
				sx={{ marginLeft: "1em" }}
				onChange={handleChangeSortBy}
			>
				{sortByOptions.map(option => (
					<ToggleButton
						value={option}
						key={option}
						sx={{
							padding: "6px 11px",
						}}
					>
						{
							<span
								style={{
									paddingLeft: "24px",
									paddingRight: "6px",
								}}
							>
								{option}
							</span>
						}
						{
							<NorthIcon
								sx={{
									fontSize: "16px",
									transform:
										sortOrder === "desc"
											? "rotate(180deg)"
											: "none",
									transition: "transform 0.2s ease-in-out",
									opacity: option === sortBy ? 1 : 0,
								}}
							/>
						}
					</ToggleButton>
				))}
			</ToggleButtonGroup>
		</Box>
	);
}

export default SortChart;
