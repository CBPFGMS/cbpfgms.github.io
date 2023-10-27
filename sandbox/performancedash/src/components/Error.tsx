import Alert from "@mui/material/Alert";

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
			<Alert severity="error">
				An error occurred while loading the data. Please try again
				later.
			</Alert>
		</div>
	);
}

export default Error;
