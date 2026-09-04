import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import { keyframes } from "@mui/material/styles";
import colors from "../utils/colors";

const halo = keyframes`
    0% { transform: scale(0.85); opacity: 0.45; }
    70% { transform: scale(1.35); opacity: 0; }
    100% { transform: scale(1.35); opacity: 0; }
`;

const ellipsis = keyframes`
    0% { content: ""; }
    25% { content: "."; }
    50% { content: ".."; }
    75% { content: "..."; }
    100% { content: ""; }
`;

function Loading() {
	return (
		<Fade
			in
			timeout={400}
		>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 3,
					minHeight: "60vh",
					width: "100%",
					background: `radial-gradient(circle at 50% 45%, ${colors.unColorLighter}14 0%, transparent 60%)`,
				}}
			>
				<Box
					sx={{
						position: "relative",
						display: "grid",
						placeItems: "center",
						width: 96,
						height: 96,
					}}
				>
					<Box
						sx={{
							position: "absolute",
							width: 96,
							height: 96,
							borderRadius: "50%",
							backgroundColor: colors.unColorLighter,
							animation: `${halo} 2s ease-out infinite`,
						}}
					/>
					<CircularProgress
						variant="determinate"
						value={100}
						size={72}
						thickness={3}
						sx={{
							position: "absolute",
							color: theme =>
								theme.palette.mode === "dark"
									? "rgba(255,255,255,0.12)"
									: "rgba(0,0,0,0.08)",
						}}
					/>
					<CircularProgress
						disableShrink
						size={72}
						thickness={3}
						sx={{
							position: "absolute",
							color: colors.unColor,
							animationDuration: "1.1s",
							"& .MuiCircularProgress-circle": {
								strokeLinecap: "round",
							},
						}}
					/>
				</Box>
				<Box sx={{ textAlign: "center" }}>
					<Typography
						variant="h6"
						sx={{
							fontWeight: 600,
							letterSpacing: "0.02em",
							color: colors.unColorDarker,
							"&::after": {
								content: '""',
								animation: `${ellipsis} 1.6s steps(1, end) infinite`,
							},
						}}
					>
						Loading data
					</Typography>
					<Typography
						variant="body2"
						sx={{ mt: 0.5, color: "text.secondary" }}
					>
						Fetching the latest contributions
					</Typography>
				</Box>
			</Box>
		</Fade>
	);
}

export default Loading;
