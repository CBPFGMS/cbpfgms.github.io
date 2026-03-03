import LinearProgress, {
	type LinearProgressProps,
} from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

const HARDCODED_TOTAL_SIZE = 218263386; //for prod, divide by 2

type LoadingProps = {
	progress: number;
};

function Loading({ progress }: LoadingProps) {
	return (
		<Container
			disableGutters={true}
			style={{
				paddingLeft: "12px",
				paddingRight: "12px",
				justifyContent: "center",
				alignItems: "center",
				display: "flex",
				flexDirection: "column",
				height: "50vh",
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
							(100 * progress) / HARDCODED_TOTAL_SIZE,
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
		</Container>
	);
}

function LinearProgressWithLabel(
	props: LinearProgressProps & { value: number },
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
