import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";

function TopIntro() {
	return (
		<Grid
			container
			spacing={2}
			justifyContent={"center"}
		>
			<Grid
				xs={10}
				mb={3}
			>
				<Typography
					variant="body1"
					style={{
						fontFamily: "Montserrat",
						fontSize: "14px",
						textAlign: "center",
					}}
				>
					Welcome to the Allocation Progress Dashboard, a
					comprehensive tool that provides an overview of the ongoing
					implementation statuses for active Country-Based Pooled Fund
					(CBPF) allocations. Here, you can visualise the progress of
					each allocation, including the percentage of funds
					disbursed, the people targeted and reached, the
					number of partners engaged, and the sectors covered. Explore
					the data using the available filters to gain insights into
					the advancement of humanitarian efforts across various funds
					and allocation types.
				</Typography>
			</Grid>
		</Grid>
	);
}

export default TopIntro;
