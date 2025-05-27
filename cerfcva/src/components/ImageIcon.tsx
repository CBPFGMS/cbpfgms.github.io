import { useState, type RefObject, useRef } from "react";
import Popper from "@mui/material/Popper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import generateImage from "../utils/generateimage";
import Snackbar from "@mui/material/Snackbar";
import Portal from "@mui/material/Portal";

type ImageIconProps = {
	refElement: RefObject<HTMLDivElement | null>;
	iconsRef: RefObject<HTMLDivElement | null>;
	fileName: string;
};

function ImageIcon({ refElement, iconsRef, fileName }: ImageIconProps) {
	const [anchorEl, setAnchorEl] = useState<SVGElement | null>(null);

	const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

	const timerRef = useRef<number | null>(null);

	function handleMouseEnter(event: React.MouseEvent<SVGElement>) {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		setAnchorEl(event.currentTarget);
	}

	function handleMouseEnterPopper() {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	}

	function handleMouseLeave() {
		timerRef.current = setTimeout(() => {
			setAnchorEl(null);
		}, 250);
	}

	function handleClose() {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		setAnchorEl(null);
	}

	const open = Boolean(anchorEl);
	const id = open ? "simple-popover" : undefined;

	return (
		<Box>
			<Portal>
				<Snackbar
					open={openSnackbar}
					autoHideDuration={2000}
					onClose={() => setOpenSnackbar(false)}
					message="Copied to clipboard!"
					anchorOrigin={{ vertical: "top", horizontal: "center" }}
				/>
			</Portal>
			<PhotoCameraIcon
				className="downloadIcon"
				fontSize="medium"
				style={{ color: "dimgray" }}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			/>
			<Popper
				id={id}
				open={open}
				anchorEl={anchorEl}
				sx={{ opacity: 0.9, zIndex: 1000 }}
				placement="left"
				onMouseEnter={handleMouseEnterPopper}
				onMouseLeave={handleClose}
			>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
					}}
					gap={0.2}
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
			</Popper>
		</Box>
	);
}

export default ImageIcon;
