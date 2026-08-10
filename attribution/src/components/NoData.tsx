import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FolderOffIcon from '@mui/icons-material/FolderOff';

export default function NoData() {
	const title = "No data",
		subtitle =
			"No allocation data for the current selection. Please try to change the year or the selected funds.";
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				textAlign: "center",
				width: "100%",
				py: { xs: 6, sm: 8 },
				px: 3,
				boxSizing: "border-box",
				borderRadius: 3,
				border: "1px dashed",
				borderColor: "divider",
				backgroundColor: theme =>
					theme.palette.mode === "light"
						? theme.palette.grey[50]
						: theme.palette.grey[900],
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: 64,
					height: 64,
					borderRadius: "50%",
					backgroundColor: theme =>
						theme.palette.mode === "light"
							? theme.palette.grey[100]
							: theme.palette.grey[800],
					mb: 2.5,
				}}
			>
				<FolderOffIcon
					sx={{
						fontSize: 32,
						color: "text.secondary",
					}}
				/>
			</Box>

			<Typography
				variant="h6"
				sx={{
					fontWeight: 600,
					color: "text.primary",
					mb: 0.5,
				}}
			>
				{title}
			</Typography>

			<Typography
				variant="body2"
				sx={{
					color: "text.secondary",
					maxWidth: 360,
					lineHeight: 1.6,
				}}
			>
				{subtitle}
			</Typography>
		</Box>
	);
}
