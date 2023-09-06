import Box from "@mui/material/Box";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileDownloadDoneOutlinedIcon from "@mui/icons-material/FileDownloadDoneOutlined";
import { Tooltip } from "react-tooltip";
import { useState } from "react";

function DownloadIcon({ handleDownloadClick }: DownloadIconProps) {
	const [clicked, setClicked] = useState<boolean>(false);
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
			onClick={() => {
				setClicked(true);
				handleDownloadClick();
			}}
		>
			<Tooltip id="download-tooltip" />
			{clicked ? (
				<FileDownloadDoneOutlinedIcon
					className="downloadIcon"
					fontSize="large"
					style={{ color: "dimgray" }}
					data-tooltip-id="download-tooltip"
					data-tooltip-html="<div style='text-align:center;'>Download started, check<br />your browser's download folder.</div>"
					data-tooltip-place="bottom"
				/>
			) : (
				<FileDownloadOutlinedIcon
					className="downloadIcon"
					fontSize="large"
					style={{ color: "dimgray" }}
					data-tooltip-id="download-tooltip"
					data-tooltip-content="Download CSV data file"
					data-tooltip-place="bottom"
				/>
			)}
		</Box>
	);
}

export default DownloadIcon;
