import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import colors from "../utils/colors";

type FundChipProps = {
	isSticky: boolean;
};

function FundChip({ isSticky }: FundChipProps) {
	return (
		<Box
			sx={{
				position: "absolute",
				bottom: "0px",
				width: "100%",
				height: "1px",
				background: colors.fundColor,
			}}
		>
			<Chip
				label="Fund Attribution"
				size="medium"
				sx={{
					position: "absolute",
					top: "-16px",
					left: "26px",
					backgroundColor: colors.fundColor,
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

export default FundChip;
