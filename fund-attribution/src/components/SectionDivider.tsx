import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import colors from "../utils/colors";

function SectionDivider({ title }: { title: string }) {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "10px",
				marginBottom: "48px",
				marginTop: "24px",
				fontFamily: "Roboto, sans-serif",
			}}
		>
			<Typography
				sx={{
					fontSize: "20px",
					fontWeight: "500",
					whiteSpace: "nowrap",
					color: `color-mix(in srgb, ${colors.fundColor} 50%, black)`,
				}}
			>
				{title}
			</Typography>
			<Box
				sx={{
					flex: 1,
					height: "1px",
					background: colors.fundColor,
				}}
			/>
		</Box>
	);
}

export default SectionDivider;
