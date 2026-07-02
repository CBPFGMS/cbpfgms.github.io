import Alert from "@mui/material/Alert";
import { type FallbackProps } from "react-error-boundary";

function Error({ error }: FallbackProps) {
	console.error(error);
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
				<br />
				If the problem persists, please contact the support team.
			</Alert>
		</div>
	);
}

export default Error;
