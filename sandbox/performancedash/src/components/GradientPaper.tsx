import Paper from "@mui/material/Paper";

function GradientPaper() {
	return (
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
	);
}

export default GradientPaper;
