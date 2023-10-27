import Snackbar from "@mui/material/Snackbar";
import Alert from '@mui/material/Alert';

function Snack({ openSnack, setOpenSnack, message }: SnackProps) {
	return (
		<Snackbar
			anchorOrigin={{ vertical: "top", horizontal: "center" }}
			open={openSnack}
			onClose={() => setOpenSnack(false)}
		>
			<Alert severity="warning">{message}</Alert>
		</Snackbar>
	);
}

export default Snack;
