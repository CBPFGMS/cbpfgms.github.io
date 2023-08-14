import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Chart from "../assets/chart.svg";

function ChartArea() {
	return (
		<Card
			sx={{
				backgroundColor: "rgb(243, 246, 249)",
				border: "1px solid rgb(229, 234, 242)",
				borderRadius: "12px",
			}}
			variant="outlined"
		>
			<CardContent>
				<Typography
					variant="h6"
					align="center"
				>
					Chart goes here
				</Typography>
			</CardContent>
			<CardMedia
				component="img"
				image={Chart}
				alt="dummy chart"
			/>
		</Card>
	);
}

export default ChartArea;
