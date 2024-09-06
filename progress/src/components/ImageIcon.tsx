import { useState, RefObject } from "react";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import generateImage from "../utils/generateimage";
import Snackbar from "@mui/material/Snackbar";

type ImageIconProps = {
	refElement: RefObject<HTMLDivElement>;
	iconsRef: RefObject<HTMLDivElement>;
	fileName: string;
};

function ImageIcon({ refElement, iconsRef, fileName }: ImageIconProps) {
	const [anchorEl, setAnchorEl] = useState<SVGElement | null>(null);

	const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

	const handleMouseEnter = (event: React.MouseEvent<SVGElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? "simple-popover" : undefined;

	return (
		<Box>
			<Snackbar
				open={openSnackbar}
				autoHideDuration={2000}
				onClose={() => setOpenSnackbar(false)}
				message="Copied to clipboard!"
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			/>
			<PhotoCameraIcon
				className="downloadIcon"
				fontSize="medium"
				style={{ color: "dimgray" }}
				onMouseEnter={handleMouseEnter}
			/>
			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				sx={{ opacity: 0.9 }}
				anchorOrigin={{
					vertical: "center",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "center",
					horizontal: "right",
				}}
			>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						backgroundColor: "#222",
					}}
				>
					<Button
						size="small"
						sx={{
							p: 2,
							backgroundColor: "#222",
							color: "white",
							"&:hover": { backgroundColor: "#444" },
						}}
						onClick={() => {
							generateImage(
								refElement,
								iconsRef,
								"download",
								fileName
							)
								.then(() => handleClose())
								.catch(() => handleClose());
						}}
					>
						<Typography fontSize={14}>Download as PNG</Typography>
					</Button>
					<Button
						size="small"
						sx={{
							p: 2,
							backgroundColor: "#222",
							color: "white",
							"&:hover": { backgroundColor: "#444" },
						}}
						onClick={() => {
							generateImage(
								refElement,
								iconsRef,
								"copy",
								fileName
							)
								.then(() => {
									setOpenSnackbar(true);
									handleClose();
								})
								.catch(() => handleClose());
						}}
					>
						<Typography fontSize={14}>Copy to clipboard</Typography>
					</Button>
				</Box>
			</Popover>
		</Box>
	);
}

export default ImageIcon;
