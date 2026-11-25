import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import colors from "../utils/colors";

type DonorChipProps = {
	isSticky: boolean;
};

function DonorChip({ isSticky }: DonorChipProps) {
	return (
		<Box
			sx={{
				position: "absolute",
				bottom: "0px",
				width: "100%",
				height: "1px",
				background: colors.donorColor,
			}}
		>
			<Chip
				label="Donor Attribution"
				size="medium"
				sx={{
					position: "absolute",
					top: "-16px",
					left: "26px",
					backgroundColor: colors.donorColor,
					color: "#fff",
					fontWeight: 500,
					fontSize: "1em",
					boxShadow: isSticky
						? "0 3px 8px -1px rgba(0, 0, 0, 0.2)"
						: "null",
				}}
			/>
		</Box>
	);
}

export default DonorChip;
