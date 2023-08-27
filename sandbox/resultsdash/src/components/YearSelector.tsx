import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";

function YearSelector({ reportYear, setReportYear }: YearSelectorProps) {
	return (
		<Box
			display={"flex"}
			alignItems={"center"}
			justifyContent={"center"}
			gap={2}
		>
			<ArrowCircleLeftOutlinedIcon
				fontSize="large"
				style={{ cursor: "pointer" }}
			/>
			<Typography variant="h6">{reportYear[0]}</Typography>
			<ArrowCircleRightOutlinedIcon fontSize="large" />
		</Box>
	);
}

export default YearSelector;
