import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

function GradientPaper() {
	return (
		<Box
			style={{
				width: "100%",
				height: "100%",
				overflow: "hidden",
				position: "absolute",
				borderRadius: "8px",
				boxSizing: "border-box",
				top: "0px",
				left: "0px",
				pointerEvents: "none",
			}}
		>
			<Paper
				style={{
					width: "140px",
					height: "140px",
					backgroundColor: "#1677ff",
					position: "absolute",
					bottom: "-70px",
					right: "-70px",
					borderRadius: "50%",
					filter: "blur(70px)",
					opacity: "0.3",
				}}
			></Paper>
		</Box>
	);
}

export default GradientPaper;
