import React from "react";
import GradientPaper from "./GradientPaper";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import contriDashImg from "../assets/img/contri-dash-img.jpg";
import opertnlDashImg from "../assets/img/opertnl-dash-img.jpg";
import allocatnProgresImg from "../assets/img/allocatn-progres-img.jpg";
import allocatnOverImg from "../assets/img/allocatn-over-img.jpg";

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
		title: "Operational Dashboard",
		subtitle: "Monitor operational metrics and performance indicators",
		url: "./index.html",
		image: opertnlDashImg,
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
			style={{
				padding: "1em",
				backgroundColor: "#f8f8f8",
				borderRadius: "8px",
				position: "relative",
			}}
		>
			<GradientPaper color={"#999999"} />
			<Grid
				container
				spacing={2}
				position={"relative"}
			>
				<Grid size={12}>
					<Typography
						style={{
							color: "var(--ocha-blue)",
							fontWeight: 700,
							margin: "30px 0 0 0",
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
						className="explore-card"
					>
						<a href={card.url}>
							<img
								alt={card.title}
								src={card.image}
								style={{
									paddingBottom: "1em",
								}}
							></img>
							<Box
								mb={2}
								style={{
									borderTop: "1px solid black",
									borderBottom: "1px solid black",
								}}
							>
								<Typography
									style={{
										fontSize: "1.5rem",
										color: "var(--ocha-blue)",
										fontWeight: 600,
										fontFamily: "Montserrat",
										marginBottom: "0.25em",
										marginTop: "0.25em",
									}}
								>
									{card.title}
								</Typography>
							</Box>
						</a>
						<Typography
							style={{
								fontSize: "1rem",
								color: "#666",
							}}
						>
							{card.subtitle}
						</Typography>
					</Grid>
				))}
			</Grid>
		</Paper>
	);
}

const MemoizedExplore = React.memo(Explore);

export default MemoizedExplore;
