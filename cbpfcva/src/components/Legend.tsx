import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import colors from "../utils/colors";

function Legend() {
	return (
		<Box
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-start",
				justifyContent: "center",
				padding: "1em",
			}}
		>
			<Box
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-start",
					paddingBottom: "0.25em",
					paddingTop: "0.25em",
					flexDirection: "row",
				}}
			>
				<Box
					style={{
						width: "1em",
						height: "1em",
						backgroundColor: colors.standardColor,
					}}
				></Box>
				<Typography
					style={{
						marginLeft: "0.5em",
						fontFamily: "Roboto",
						fontSize: "14px",
						color: "#111",
					}}
				>
					Standard
				</Typography>
			</Box>
			<Box
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-start",
					paddingBottom: "0.25em",
					paddingTop: "0.25em",
					flexDirection: "row",
				}}
			>
				<Box
					style={{
						width: "1em",
						height: "1em",
						backgroundColor: colors.reserveColor,
					}}
				></Box>
				<Typography
					style={{
						marginLeft: "0.5em",
						fontFamily: "Roboto",
						fontSize: "14px",
						color: "#111",
					}}
				>
					Reserve
				</Typography>
			</Box>
		</Box>
	);
}

export default Legend;
