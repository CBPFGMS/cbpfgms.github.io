import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

function InvalidDonor() {
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
			<Box
				sx={{
					width: "50%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Typography
					variant="h5"
					gutterBottom
					sx={{
						textTransform: "uppercase",
						marginBottom: "1em",
					}}
				>
					Invalid Donor
				</Typography>
				<Typography
					variant="body1"
					gutterBottom
				>
					The donor you are looking for is not in our database. Please
					contact support for obtaining a valid page link.
				</Typography>
			</Box>
		</Container>
	);
}

export default InvalidDonor;
