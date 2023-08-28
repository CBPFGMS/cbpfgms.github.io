import Paper from "@mui/material/Paper";

function GradientPaper() {
	return (
		<Paper
			style={{
				width: "120px",
				height: "120px",
				backgroundColor: "#1677ff",
				position: "absolute",
				bottom: "-60px",
				right: "-60px",
				borderRadius: "50%",
				filter: "blur(60px)",
				opacity: "0.2",
			}}
		></Paper>
	);
}

export default GradientPaper;
