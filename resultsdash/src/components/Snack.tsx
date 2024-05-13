import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { SnackProps } from "../types";
import Portal from "@mui/material/Portal";

function Snack({ openSnack, setOpenSnack, message }: SnackProps) {
	return (
		<Portal>
			<Snackbar
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
				open={openSnack}
				onClose={() => setOpenSnack(false)}
			>
				<Alert severity="warning">{message}</Alert>
			</Snackbar>
		</Portal>
	);
}

export default Snack;
