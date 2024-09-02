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
					Welcome to the Country Based Pooled Fund (CBPF) Allocation
					Progress Dashboard, a comprehensive tool that provides an
					overview of the Targeted vs Achieved statuses for funded
					projects. Here, you can visualize the progress of each
					project, including the percentage of people targeted and
					reached by type of partners engaged, sectors covered,
					categorization of people, by disability and by Gender based
					violence (GBV) category. Additionally this dashboard for the
					first time explore the achievements against the targeted
					Global Indicators across funds.
				</Typography>
			</Grid>
		</Grid>
	);
}

export default TopIntro;
