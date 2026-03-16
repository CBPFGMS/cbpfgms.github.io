import React from "react";
import GradientPaper from "./GradientPaper";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import contriDashImg from "../assets/img/contri-dash-img.jpg";
import allocatnProgresImg from "../assets/img/allocatn-progres-img.jpg";
import allocatnOverImg from "../assets/img/allocatn-over-img.jpg";
import allocTimeImg from "../assets/img/alloc-timeline-dash.png";

type CardsDatum = {
	image: string;
	title: string;
	subtitle: string;
	url: string;
};

const cardsData: CardsDatum[] = [
	{
		title: "Contributions Dashboard",
		subtitle: "View detailed contribution data and funding information",
		url: "./full-contribution.html",
		image: contriDashImg,
	},
	{
		title: "Allocations Timeline",
		subtitle:
			"View detailed timeline of allocations",
		url: "./allocationstimeline_ft.html",
		image: allocTimeImg,
	},
	{
		title: "Allocation Progress",
		subtitle: "Track allocation progress and status updates",
		url: "./progress-fasttrack.html",
		image: allocatnProgresImg,
	},
	{
		title: "Allocation Overview",
		subtitle: "Comprehensive overview of allocation distributions",
		url: "./allocations-overview-ft.html",
		image: allocatnOverImg,
	},
];

function Explore() {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 2,
				backgroundColor: "#f8f8f8",
				borderRadius: "8px",
				position: "relative",
			}}
		>
			<GradientPaper color={"#999999"} />
			<Grid
				container
				spacing={2}
				alignItems="stretch"
				position="relative"
				mb={4}
				style={{ paddingLeft: "30px", paddingRight: "30px" }}
			>
				<Grid size={12}>
					<Typography
						sx={{
							color: "var(--ocha-blue)",
							fontWeight: 700,
							mt: 4,
							textAlign: "center",
							fontSize: "2rem",
							fontFamily: "Montserrat",
						}}
					>
						Explore Dashboards
					</Typography>
				</Grid>

				{cardsData.map((card, index) => (
					<Grid
						key={index}
						size={3}
						sx={{ display: "flex" }}
						className="explore-card"
					>
						<Card
							component="a"
							href={card.url}
							elevation={0}
							sx={{
								height: "100%",
								display: "flex",
								flexDirection: "column",
								textDecoration: "none",
								transition: "transform 0.2s, box-shadow 0.2s",
								boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
								"&:hover": {
									transform: "translateY(-6px)",
									boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
								},
							}}
						>
							<Box sx={{ padding: "20px" }}>
								<CardMedia
									component="img"
									image={card.image}
									alt={card.title}
									sx={{
										width: "100%",
										height: "auto",
										display: "block",
									}}
								/>
							</Box>
							<CardContent
								sx={{
									display: "flex",
									flexDirection: "column",
									flexGrow: 1,
								}}
							>
								<Box
									sx={{
										borderTop: "1px solid black",
										borderBottom: "1px solid black",
										mb: 2,
									}}
								>
									<Typography
										sx={{
											fontSize: "1.5rem",
											color: "var(--ocha-blue)",
											fontWeight: 600,
											fontFamily: "Montserrat",
											my: "0.25em",
											lineHeight: 1.4,
											textAlign: "center",
										}}
									>
										{card.title}
									</Typography>
								</Box>

								<Typography
									sx={{
										fontSize: "1rem",
										color: "#666",
										textAlign: "center",
									}}
								>
									{card.subtitle}
								</Typography>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>
		</Paper>
	);
}

export default React.memo(Explore);
