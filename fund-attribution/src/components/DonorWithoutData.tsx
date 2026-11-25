import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FolderOffIcon from "@mui/icons-material/FolderOff";

function DonorWithoutData({ donorName }: { donorName: string }) {
	return (
		<Container
			maxWidth="sm"
			sx={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Card
				elevation={0}
				sx={{
					width: "100%",
					borderRadius: 4,
					border: "1px solid",
					borderColor: "divider",
					boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
					overflow: "hidden",
				}}
			>
				<CardContent
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						textAlign: "center",
						padding: { xs: 4, sm: 6 },
					}}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: 64,
							height: 38,
							borderRadius: "50%",
							color: "error.main",
							marginBottom: 2,
						}}
					>
						<FolderOffIcon
							sx={{
								fontSize: 32,
								color: "text.secondary",
							}}
						/>
					</Box>

					<Typography
						variant="h5"
						component="h1"
						gutterBottom
						sx={{
							color: "text.primary",
							marginBottom: 2,
							fontWeight: 600,
						}}
					>
						No data for {donorName}
					</Typography>

					<Typography
						variant="body1"
						color="text.secondary"
						sx={{ maxWidth: "360px", lineHeight: 1.6 }}
					>
						The donor you are looking for has no contributions data
						for the selected period, therefore having no attribution
						value.
					</Typography>
				</CardContent>
			</Card>
		</Container>
	);
}

export default DonorWithoutData;
