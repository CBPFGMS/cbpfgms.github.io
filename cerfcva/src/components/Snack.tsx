import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Portal from "@mui/material/Portal";

type SnackProps = {
	openSnack: boolean;
	setOpenSnack: React.Dispatch<React.SetStateAction<boolean>>;
	message: string;
};

function Snack({ openSnack, setOpenSnack, message }: SnackProps) {
	return (
		<Portal>
			<Snackbar
				sx={{ zIndex: 9999 }}
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
