import Box from "@mui/material/Box";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import colors from "../utils/colors";

type StepHeaderProps = {
	number: string;
	title: string;
	subtitle: string;
	active: boolean;
	done: boolean;
	doneTitle: string;
	doneSubtitle?: string;
};

function StepHeader({
	number,
	title,
	subtitle,
	active,
	done,
	doneTitle,
	doneSubtitle,
}: StepHeaderProps) {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "flex-start",
				gap: 2,
				mb: done || active ? 2.5 : 0,
				minHeight: "50px",
			}}
		>
			<Box
				sx={{
					width: 40,
					height: 40,
					borderRadius: "50%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
					background: done
						? colors.doneGradientStart
						: active
							? colors.activeGradientStart
							: alpha(colors.inactiveBackground, 0.1),
					boxShadow:
						done || active ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
					transition: "all 0.3s ease",
				}}
			>
				{done ? (
					<CheckCircleIcon sx={{ color: "#fff", fontSize: 20 }} />
				) : (
					<Typography
						sx={{
							color: active ? "#fff" : "text.secondary",
							fontWeight: 700,
							fontSize: "1.2em",
						}}
					>
						{number}
					</Typography>
				)}
			</Box>
			<Box sx={{ textAlign: "left", paddingLeft: 1 }}>
				{done ? (
					<Typography
						variant="h6"
						sx={{
							fontWeight: 700,
							color: "#444",
							fontSize: "1.2rem",
							transition: "color 0.3s ease",
						}}
					>
						{doneTitle}
						{doneSubtitle && (
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ lineHeight: 1.2 }}
							>
								{doneSubtitle}
							</Typography>
						)}
					</Typography>
				) : (
					<>
						<Typography
							variant="h6"
							sx={{
								fontWeight: 700,
								color: active
									? colors.activeGradientStart
									: "text.secondary",
								fontSize: "1.4em",
								transition: "color 0.3s ease",
								lineHeight: 1.4,
							}}
						>
							{title}
						</Typography>
						{active && (
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ lineHeight: 1.2 }}
							>
								{subtitle}
							</Typography>
						)}
					</>
				)}
			</Box>
		</Box>
	);
}

export default StepHeader;
