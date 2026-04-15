import { useRef, RefObject } from "react";
import DownloadIcon from "./DownloadIcon";
import ImageIcon from "./ImageIcon";
import Box from "@mui/material/Box";
import { DownloadStates, Charts } from "./MainContainer";
import WarningIcon from "@mui/icons-material/Warning";
import constants from "../utils/constants";

const { disclaimerWarningColor, disclaimerText } = constants;

type DownloadAndImageContainerProps = {
	handleDownloadClick: () => void;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	type: Charts;
	refElement: RefObject<HTMLDivElement>;
	fileName: string;
	showDisclaimer?: boolean;
};

function DownloadAndImageContainer({
	handleDownloadClick,
	clickedDownload,
	setClickedDownload,
	type,
	refElement,
	fileName,
	showDisclaimer = false,
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
				alignItems: "center",
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
			{showDisclaimer && (
				<WarningIcon
					data-tooltip-id="tooltip"
					data-tooltip-content={disclaimerText}
					data-tooltip-place="bottom"
					style={{
						color: disclaimerWarningColor,
						verticalAlign: "text-bottom",
						marginRight: "5px",
						fontSize: "1.2em",
					}}
				/>
			)}
		</Box>
	);
}

export default DownloadAndImageContainer;
