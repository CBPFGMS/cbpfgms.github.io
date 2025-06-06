import { useRef, type RefObject } from "react";
import DownloadIcon from "./DownloadIcon";
import ImageIcon from "./ImageIcon";
import Box from "@mui/material/Box";
import type { DownloadStates, Charts } from "./MainContainer";

type DownloadAndImageContainerProps = {
	handleDownloadClick: () => void;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	type: Charts;
	refElement: RefObject<HTMLDivElement | null>;
	fileName: string;
	fromMap?: boolean;
	zoomControlRef?: RefObject<HTMLDivElement | null>;
};

function DownloadAndImageContainer({
	handleDownloadClick,
	clickedDownload,
	setClickedDownload,
	type,
	refElement,
	fileName,
	fromMap = false,
	zoomControlRef,
}: DownloadAndImageContainerProps) {
	const iconsRef = useRef<HTMLDivElement>(null);

	return (
		<Box
			style={{
				position: "absolute",
				top: fromMap ? "6px" : "0",
				right: fromMap ? "6px" : "0",
				paddingTop: "0em",
				paddingRight: "0.5em",
				cursor: "pointer",
				zIndex: 1000,
				display: "flex",
				flexDirection: "column",
				backgroundColor: fromMap ? "rgba(255, 255, 255, 0.8)" : "",
				padding: fromMap ? "0.5em" : "",
				borderRadius: fromMap ? "0.25em" : "0",
				border: fromMap ? "2px solid rgba(0, 0, 0, 0.2)" : "",
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
				zoomControlRef={zoomControlRef}
			/>
		</Box>
	);
}

export default DownloadAndImageContainer;
