import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

function TopIntro() {
	return (
		<Grid
			container
			spacing={2}
			mt={6}
			justifyContent={"flex-start"}
		>
			<Typography
				variant="h2"
				style={{
					fontFamily: "Montserrat",
					fontSize: "2.5rem",
					fontWeight: 700,
					color: "var(--ocha-blue)",
				}}
				mb={2}
			>
				US Contributions
			</Typography>
			<Typography
				variant="body1"
				style={{
					fontFamily: "Montserrat",
					fontSize: "1.1rem",
					color: "#666",
					lineHeight: 1.6,
					maxWidth: "900px",
				}}
			>
				This dashboard provides comprehensive insights into humanitarian
				financing progress made possible through generous contributions
				from the United States. Track key performance indicators,
				explore detailed dashboards, and monitor the impact of US
				funding across Country Based Pooled Funds (CBPF) projects
				worldwide.
			</Typography>
		</Grid>
	);
}

export default TopIntro;
