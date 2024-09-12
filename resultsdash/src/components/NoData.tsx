import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function NoData() {
	return (
		<Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			style={{
				height: "100%",
				width: "100%",
			}}
		>
			<Typography variant="body1">
				No data available for the selection
			</Typography>
		</Box>
	);
}

export default NoData;
