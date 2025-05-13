import { useRef } from "react";
import DownloadIcon from "./DownloadIcon";
import ImageIcon from "./ImageIcon";
import Box from "@mui/material/Box";
import { DownloadAndImageContainerProps } from "../types";

function DownloadAndImageContainer({
	handleDownloadClick,
	clickedDownload,
	setClickedDownload,
	type,
	refElement,
	fileName,
}: DownloadAndImageContainerProps) {
	const iconsRef = useRef<HTMLDivElement>(null);

	return (
		<Box
			style={{
				position: "absolute",
				top: "0",
				right: "0",
				paddingTop: "0em",
				paddingRight: "0.5em",
				cursor: "pointer",
				zIndex: 1000,
				display: "flex",
				flexDirection: "column",
			}}
			ref={iconsRef}
		>
			<DownloadIcon
				handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type={type}
			/>
			<ImageIcon
				refElement={refElement}
				iconsRef={iconsRef}
				fileName={fileName}
			/>
		</Box>
	);
}

export default DownloadAndImageContainer;
