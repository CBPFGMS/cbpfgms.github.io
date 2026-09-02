import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

function Loading() {
	return (
		<Container
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: "1em",
				height: "100%",
			}}
		>
			<Box sx={{ height: "30%" }}></Box>
			<Box sx={{ display: "flex", justifyContent: "center" }}>
				<CircularProgress />
			</Box>
			<Typography
				variant="h6"
				align="center"
				style={{ marginTop: "1.5em" }}
			>
				Loading data
			</Typography>
		</Container>
	);
}

export default Loading;
