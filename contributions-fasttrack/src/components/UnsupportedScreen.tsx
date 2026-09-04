import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SvgIcon from "@mui/material/SvgIcon";
import type { SvgIconProps } from "@mui/material";
import { constants } from "../utils/constants.ts";

const minWidth = constants.minWidth;

function ExpandIcon(props: SvgIconProps) {
	return (
		<SvgIcon
			{...props}
			viewBox="0 0 56 56"
		>
			<rect
				x="4"
				y="12"
				width="48"
				height="32"
				rx="3"
				stroke="currentColor"
				strokeWidth="2"
				fill="none"
			/>
			<path
				d="M14 44h28"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<path
				d="M10 22l-6 6 6 6"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
			<path
				d="M46 22l6 6-6 6"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
		</SvgIcon>
	);
}

function UnsupportedScreenNotice() {
	return (
		<Box
			sx={{
				width: "100%",
				px: 4,
				paddingTop: "5em",
				paddingBottom: "5em",
				alignItems: "center",
				justifyContent: "center",
				textAlign: "center",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<ExpandIcon sx={{ fontSize: 76, color: "primary.main", mb: 3 }} />

			<Typography
				variant="h5"
				component="h1"
				gutterBottom
				sx={{
					fontWeight: 600,
					letterSpacing: "-0.01em",
				}}
			>
				Wider screen needed
			</Typography>

			<Typography
				variant="body1"
				color="text.secondary"
				sx={{ maxWidth: 320 }}
			>
				This page is built for larger displays. Please open it on a
				screen at least {minWidth}px wide, or resize your browser
				window.
			</Typography>
		</Box>
	);
}

export default UnsupportedScreenNotice;
