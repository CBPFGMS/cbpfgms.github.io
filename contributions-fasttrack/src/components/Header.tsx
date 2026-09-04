import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

function Header({ year }: { year: number | null }) {
	return (
		<Container
			disableGutters={true}
			style={{
				paddingLeft: "12px",
				paddingRight: "12px",
			}}
		>
			<Box
				sx={{
					width: "100%",
					display: "flex",
					justifyContent: "center",
					flexDirection: "column",
					alignItems: "center",
					marginTop: "1em",
					marginBottom: "2em",
				}}
			>
				<title>United States contributions overview</title>
				<img
					src="https://flagcdn.com/us.svg"
					width="76px"
					style={{
						borderRadius: "0.3rem",
						boxShadow: "0 0.5rem 0.5rem rgba(0, 0, 0, 0.1)",
					}}
					alt="United States flag"
				/>
				<Typography
					sx={{
						fontSize: "3.5em",
						fontWeight: 300,
						textTransform: "uppercase",
						fontFamily: "Helvetica",
						lineHeight: 1.2,
						marginTop: "0.4em",
						textAlign: "center",
					}}
				>
					United States
				</Typography>
				<Typography
					sx={{
						fontSize: "1.4em",
						fontWeight: 300,
						textTransform: "uppercase",
						fontFamily: "Helvetica",
						color: "#212529bf",
						marginBottom: "2em",
					}}
				>
					Contributions Overview
				</Typography>
				<Typography
					sx={{
						fontSize: "1em",
						fontWeight: 300,
						textTransform: "none",
						fontFamily: "Helvetica",
						color: "#212529e1",
					}}
				>
					{`This page provides an overview of the generous United States' contributions to OCHA. Since ${year || new Date().getFullYear()} onwards, the United States has played a pivotal role in supporting humanitarian efforts worldwide.`}
				</Typography>
			</Box>
		</Container>
	);
}

export default Header;
