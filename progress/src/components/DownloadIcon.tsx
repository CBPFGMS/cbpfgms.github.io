import Box from "@mui/material/Box";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileDownloadDoneOutlinedIcon from "@mui/icons-material/FileDownloadDoneOutlined";
import { DownloadStates, Charts } from "./MainContainer";

type DownloadIconProps = {
	//handleDownloadClick: () => void;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	type: Charts;
};

function DownloadIcon({
	//handleDownloadClick,
	clickedDownload,
	setClickedDownload,
	type,
}: DownloadIconProps) {
	return (
		<Box
			style={{
				position: "absolute",
				top: "0",
				right: "0",
				padding: "0.5em",
				cursor: "pointer",
				zIndex: 1000,
			}}
			// onClick={() => {
			// 	setClickedDownload(prev => ({ ...prev, [type]: true }));
			// 	//handleDownloadClick();
			// }}
		>
			{clickedDownload[type] ? (
				<FileDownloadDoneOutlinedIcon
					className="downloadIcon"
					fontSize="large"
					style={{ color: "dimgray" }}
					data-tooltip-id="tooltip"
					data-tooltip-html="<div style='text-align:center;'>Download started, check<br />your browser's download folder.</div>"
					data-tooltip-place="bottom"
				/>
			) : (
				<FileDownloadOutlinedIcon
					className="downloadIcon"
					fontSize="large"
					style={{ color: "dimgray" }}
					data-tooltip-id="tooltip"
					//data-tooltip-content="Download CSV data file"
					data-tooltip-html="<div style='text-align:center;'>Feature coming soon:<br />Download CSV data file</div>"
					data-tooltip-place="bottom"
				/>
			)}
		</Box>
	);
}

export default DownloadIcon;
