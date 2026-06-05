import React from "react";
import GradientPaper from "./GradientPaper";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

import contriDashImg from "../assets/img/contri-dash-img.jpg";
import allocatnProgresImg from "../assets/img/allocatn-progres-img.jpg";
import allocatnOverImg from "../assets/img/allocatn-over-img.jpg";
import allocTimeImg from "../assets/img/alloc-timeline-dash.png";
import activitiesImg from "../assets/img/activities-img.png";

type CardsDatum = {
	image: string;
	title: string;
	subtitle: string;
	url: string;
};

// Three main featured cards
const mainCards: CardsDatum[] = [
	{
		title: "Allocation Progress",
		subtitle:
			"Real-time tracking of allocations from launch to implementation. Monitor key parameters, regular progress updates, and completion stages. Identify delays and follow-up needs across funds and projects.",
		url: "./us_progress",
		image: allocatnProgresImg,
	},
	{
		title: "Allocation Overview",
		subtitle:
			"View a consolidated geographic summary of allocation distributions. Compare funding levels, partners, projects, and targeted or reached people. Filter results by sector and project status for deeper analysis.",
		url: "./us_allocations",
		image: allocatnOverImg,
	},
	{
		title: "Activities Overview",
		subtitle:
			"Explore the geographic distribution of project activities. Review where funded activities are taking place and which partners are implementing them. Strengthen visibility of implementation coverage and field-level reach.",
		url: "./us_activities",
		image: activitiesImg,
	},
];

// Secondary links — smaller, less prominent; add more as needed
const secondaryCards: CardsDatum[] = [
	{
		title: "Contributions Dashboard",
		subtitle: "View detailed contribution data and funding information",
		url: "./us_contributions",
		image: contriDashImg,
	},
	{
		title: "Allocations Timeline",
		subtitle: "View detailed timeline of allocations",
		url: "./us_timeline",
		image: allocTimeImg,
	},
	// Add more secondary links here
];

function Explore() {
	return (
		<Paper
			elevation={0}
			sx={{
				p: { xs: 2, md: 3 },
				backgroundColor: "#f8f8f8",
				borderRadius: "12px",
				position: "relative",
				overflow: "hidden",
			}}
		>
			<GradientPaper color={"#999999"} />
			<Box sx={{ position: "relative" }}>
				<Typography
					variant="overline"
					sx={{
						display: "block",
						textAlign: "center",
						letterSpacing: 2,
						color: "text.secondary",
					}}
				>
					QUICK ACCESS
				</Typography>
				<Typography
					sx={{
						color: "var(--ocha-blue)",
						fontWeight: 700,
						mb: 4,
						textAlign: "center",
						fontSize: "2rem",
						fontFamily: "Montserrat",
						letterSpacing: "-0.02em",
					}}
				>
					Explore Dashboards
				</Typography>

				{/* ── Main cards (3 columns) ── */}
				<Grid
					container
					spacing={2.5}
					alignItems="stretch"
					mb={4}
				>
					{mainCards.map((card, index) => (
						<Grid
							key={index}
							size={4}
							sx={{ display: "flex" }}
							className="explore-card"
						>
							<Card
								component="a"
								href={card.url}
								elevation={0}
								sx={{
									position: "relative",
									height: "100%",
									width: "100%",
									display: "flex",
									flexDirection: "column",
									textDecoration: "none !important",
									borderRadius: "10px",
									overflow: "hidden",
									boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
									border: "1px solid #ebeef1",
									transition:
										"transform 0.25s ease, box-shadow 0.25s ease",
									"&:hover": {
										transform: "translateY(-6px)",
										boxShadow:
											"0 8px 24px rgba(0,0,0,0.14)",
										borderColor: "var(--ocha-blue-lighter)",
									},
								}}
							>
								{card.title === "Activities Map" && (
									<Chip
										label="New"
										size="small"
										sx={{
											position: "absolute",
											top: "6%",
											left: "8%",
											fontFamily: "Montserrat",
											fontWeight: 900,
											fontSize: "0.8rem",
											backgroundColor: "#f02a2a",
											color: "#fff",
											letterSpacing: "0.05em",
											textTransform: "uppercase",
											zIndex: 10,
											p: 0.5,
										}}
									/>
								)}
								<Box
									sx={{
										overflow: "hidden",
										position: "relative",
										lineHeight: 0,
									}}
								>
									<CardMedia
										component="img"
										image={card.image}
										alt={card.title}
										className="card-image"
										sx={{
											width: "100%",
											height: "auto",
											aspectRatio: "16 / 8",
											objectFit: "cover",
											transform: "scale(1.02)",
										}}
									/>
								</Box>
								<Box
									sx={{
										height: "3px",
										background: "var(--ocha-blue)",
										flexShrink: 0,
									}}
								/>
								<CardContent
									sx={{
										display: "flex",
										flexDirection: "column",
										flexGrow: 1,
										p: "16px 20px 20px",
										backgroundColor: "#fff",
									}}
								>
									<Typography
										sx={{
											fontSize: "1.3rem",
											color: "var(--ocha-blue)",
											fontWeight: 700,
											fontFamily: "Montserrat",
											lineHeight: 1.35,
											mb: 1,
										}}
									>
										{card.title}
									</Typography>
									<Typography
										sx={{
											fontSize: "0.75rem",
											color: "#666",
											lineHeight: 1.5,
										}}
									>
										{card.subtitle}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>
				{secondaryCards.length > 0 && (
					<>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1.5,
								mb: 3,
							}}
						>
							<Box
								sx={{
									height: "1px",
									flex: 1,
									backgroundColor: "#ddd",
								}}
							/>
							<Chip
								label="More"
								size="small"
								sx={{
									fontFamily: "Montserrat",
									fontWeight: 600,
									fontSize: "0.7rem",
									backgroundColor: "#e8eef5",
									color: "var(--ocha-blue)",
									letterSpacing: "0.05em",
									textTransform: "uppercase",
									height: "22px",
								}}
							/>
							<Box
								sx={{
									height: "1px",
									flex: 1,
									backgroundColor: "#ddd",
								}}
							/>
						</Box>

						<Grid
							container
							spacing={2}
						>
							{secondaryCards.map((card, index) => (
								<Grid
									key={index}
									size={{ xs: 12, sm: 6, md: 4 }}
									sx={{ display: "flex" }}
								>
									<Card
										component="a"
										href={card.url}
										elevation={0}
										sx={{
											width: "100%",
											height: 74,
											display: "flex",
											flexDirection: "row",
											alignItems: "stretch",
											textDecoration: "none !important",
											borderRadius: "8px",
											overflow: "hidden",
											boxShadow:
												"0 1px 6px rgba(0,0,0,0.07)",
											backgroundColor: "#fff",
											transition:
												"transform 0.2s ease, box-shadow 0.2s ease",
											"&:hover": {
												transform: "translateY(-3px)",
												boxShadow:
													"0 4px 14px rgba(0,0,0,0.12)",
											},
										}}
									>
										<Box
											sx={{
												width: 80,
												minWidth: 80,
												height: 74,
												overflow: "hidden",
												flexShrink: 0,
											}}
										>
											<CardMedia
												component="img"
												image={card.image}
												alt={card.title}
												sx={{
													width: "100%",
													height: "100%",
													objectFit: "cover",
													display: "block",
												}}
											/>
										</Box>
										<Box
											sx={{
												width: "3px",
												alignSelf: "stretch",
												backgroundColor:
													"var(--ocha-blue)",
												opacity: 0.6,
												flexShrink: 0,
											}}
										/>
										<CardContent
											sx={{
												p: "10px 14px !important",
												flex: 1,
												minWidth: 0,
												flexDirection: "column",
												justifyContent: "space-between",
											}}
										>
											<Typography
												sx={{
													fontSize: "0.875rem",
													color: "var(--ocha-blue)",
													fontWeight: 700,
													fontFamily: "Montserrat",
													lineHeight: 1.3,
													mb: 0.4,
													whiteSpace: "nowrap",
													overflow: "hidden",
													textOverflow: "ellipsis",
												}}
											>
												{card.title}
											</Typography>
											<Typography
												sx={{
													fontSize: "0.75rem",
													color: "#888",
													lineHeight: 1.4,
													display: "-webkit-box",
													WebkitLineClamp: 2,
													WebkitBoxOrient: "vertical",
													overflow: "hidden",
												}}
											>
												{card.subtitle}
											</Typography>
										</CardContent>
									</Card>
								</Grid>
							))}
						</Grid>
					</>
				)}
			</Box>
		</Paper>
	);
}

export default React.memo(Explore);
