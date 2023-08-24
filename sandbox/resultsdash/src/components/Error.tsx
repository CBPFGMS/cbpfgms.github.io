import Typography from "@mui/material/Typography";

function Error() {
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Typography
				variant="body2"
				align="center"
				mt={3}
				style={{ whiteSpace: "pre-line" }}
			>
				An error occurred while loading the data.{"\n"} Please try again
				later.
			</Typography>
		</div>
	);
}

export default Error;
