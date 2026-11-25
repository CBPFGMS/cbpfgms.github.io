import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

function GradientPaper({ color }: { color: string }) {
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
				zIndex: 0,
			}}
		>
			<Paper
				style={{
					width: "140px",
					height: "140px",
					backgroundColor: color,
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
