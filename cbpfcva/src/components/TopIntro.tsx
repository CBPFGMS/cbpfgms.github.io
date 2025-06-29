import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

function TopIntro() {
	return (
		<Grid
			container
			spacing={2}
			justifyContent={"center"}
		>
			<Grid
				size={10}
				mb={2}
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					padding: "1em",
				}}
			>
				<Typography
					variant={"h4"}
					mb={3}
					style={{
						fontFamily: "Montserrat",
						fontSize: "40px",
						fontWeight: 700,
					}}
				>
					Cash and Voucher Assistance
				</Typography>
				<Typography
					variant="body1"
					style={{
						fontFamily: "Montserrat",
						fontSize: "14px",
						textAlign: "center",
					}}
				>
					Cash and Voucher Assistance (CVA) – particularly when
					provided with minimum restrictions – is an effective
					people-centered modality that provides dignity, choice and
					empowerment to affected populations. This dashboard provides
					an overview of CERF funding for cash and voucher assistance,
					including the funding trends, the types of organizations
					involved, the sectors in which CVA is implemented, and the
					groups of people reached. The dashboard only shows the{" "}
					<span style={{ fontStyle: "italic" }}>transfer value</span>,
					i.e., the amount that ends up in the hands of affected
					people; it does not show indirect costs, including transfer
					costs.
				</Typography>
			</Grid>
		</Grid>
	);
}

export default TopIntro;
