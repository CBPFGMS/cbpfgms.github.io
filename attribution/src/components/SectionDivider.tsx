import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function SectionDivider({ title }: { title: string }) {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "10px",
				marginBottom: "14px",
				marginTop: "6px",
				fontFamily: "Roboto, sans-serif",
			}}
		>
			<Typography
				sx={{
					fontSize: "18px",
					fontWeight: "500",
					whiteSpace: "nowrap",
				}}
			>
				{title}
			</Typography>
			<Box
				sx={{
					flex: 1,
					height: "1px",
					background: "#b5d4f4",
				}}
			/>
		</Box>
	);
}

export default SectionDivider;
