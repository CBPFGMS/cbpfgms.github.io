import Box from "@mui/material/Box";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileDownloadDoneOutlinedIcon from "@mui/icons-material/FileDownloadDoneOutlined";
import type { DownloadStates, Charts } from "./MainContainer";

type DownloadIconProps = {
	handleDownloadClick: () => void;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	type: Charts;
};

function DownloadIcon({
	handleDownloadClick,
	clickedDownload,
	setClickedDownload,
	type,
}: DownloadIconProps) {
	return (
		<Box
			onClick={() => {
				setClickedDownload(prev => ({ ...prev, [type]: true }));
				if (!clickedDownload[type]) handleDownloadClick();
			}}
		>
			{clickedDownload[type] ? (
				<FileDownloadDoneOutlinedIcon
					className="downloadIcon"
					fontSize="medium"
					style={{ color: "dimgray" }}
					data-tooltip-id="tooltip"
					data-tooltip-html="<div style='text-align:center;'>Download started, check<br />your browser's download folder.</div>"
					data-tooltip-place="bottom"
				/>
			) : (
				<FileDownloadOutlinedIcon
					className="downloadIcon"
					fontSize="medium"
					style={{ color: "dimgray" }}
					data-tooltip-id="tooltip"
					data-tooltip-content={"Download CSV data file"}
					data-tooltip-place="bottom"
				/>
			)}
		</Box>
	);
}

export default DownloadIcon;
