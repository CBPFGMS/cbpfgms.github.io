import LinearProgress, {
	LinearProgressProps,
} from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const HARDCODED_TOTAL_SIZE = 170278856;

type LoadingProps = {
	progress: number;
};

function Loading({ progress }: LoadingProps) {
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				justifySelf: "center",
				alignItems: "center",
				alignSelf: "center",
			}}
		>
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					width: "100%",
				}}
			>
				<Box sx={{ width: "80%" }}>
					<LinearProgressWithLabel
						sx={{ height: 10, borderRadius: 5 }}
						value={Math.min(
							100,
							(100 * progress) / HARDCODED_TOTAL_SIZE
						)}
					/>
				</Box>
			</Box>
			<Typography
				variant="h6"
				align="center"
				mt={3}
			>
				Loading data
			</Typography>
		</div>
	);
}

function LinearProgressWithLabel(
	props: LinearProgressProps & { value: number }
) {
	return (
		<Box sx={{ display: "flex", alignItems: "center" }}>
			<Box sx={{ width: "100%", mr: 1 }}>
				<LinearProgress
					variant="determinate"
					{...props}
				/>
			</Box>
			<Box sx={{ minWidth: 35 }}>
				<Typography
					variant="body2"
					sx={{ color: "text.secondary" }}
				>{`${Math.round(props.value)}%`}</Typography>
			</Box>
		</Box>
	);
}

export default Loading;
