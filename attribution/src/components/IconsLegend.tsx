import Box from "@mui/material/Box";
import AbsoluteIcon from "./AbsoluteIcon";
import PercentageIcon from "./PercentageIcon";
import Typography from "@mui/material/Typography";

const boxStyle = {
	flexDirection: "row",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
};

const textStyle = {
	fontWeight: 400,
	color: "#323437",
	lineHeight: "1.5",
	marginBottom: "0",
	fontSize: "0.875em",
};

function IconsLegend({ donorName }: { donorName: string }) {
	return (
		<Box
			sx={{
				width: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-start",
				marginTop: "2.5em",
				gap: "0.25em",
			}}
		>
			<Typography
				component="span"
				sx={textStyle}
			>
				In this attribution dashboard, numbers can indicate either:
			</Typography>
			<Box sx={boxStyle}>
				<AbsoluteIcon />
				<Typography
					component="span"
					sx={{ ...textStyle, marginLeft: "0.5em" }}
				>
					Absolute values, independent of {donorName}'s attribution
					percentage.
				</Typography>
			</Box>
			<Box sx={boxStyle}>
				<PercentageIcon />
				<Typography
					component="span"
					sx={{ ...textStyle, marginLeft: "0.5em" }}
				>
					Values calculated based on {donorName}'s attribution
					percentage.
				</Typography>
			</Box>
		</Box>
	);
}

export default IconsLegend;
