import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import colors from "../utils/colors";

function Legend() {
	return (
		<Box
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				marginLeft: "3em",
				gap: "1.5em",
			}}
		>
			<Box
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					gap: "0.5em",
				}}
			>
				<Box
					style={{
						width: "12px",
						height: "12px",
						backgroundColor: colors.unColorTotal,
						borderRadius: "2px",
					}}
				/>
				<Typography variant="body2">Paid</Typography>
			</Box>
			<Box
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					gap: "0.5em",
				}}
			>
				<Box
					style={{
						width: "12px",
						height: "12px",
						backgroundColor: colors.unColorPledged,
						borderRadius: "2px",
					}}
				/>
				<Typography variant="body2">Pledged</Typography>
			</Box>
		</Box>
	);
}

export default Legend;
