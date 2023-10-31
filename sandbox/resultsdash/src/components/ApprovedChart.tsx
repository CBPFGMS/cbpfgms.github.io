import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

const donutBoxSize = 200;

function ApprovedChart({ approvedData, year }: ApprovedChartProps) {
	// Implement component logic here

	return (
		<Paper
			elevation={1}
			style={{
				padding: "12px",
				backgroundColor: "#ffffff",
			}}
		>
			<Box
				style={{
					width: donutBoxSize,
					height: donutBoxSize,
				}}
			>
				<Typography>Foo</Typography>
			</Box>
		</Paper>
	);
}

export default ApprovedChart;
