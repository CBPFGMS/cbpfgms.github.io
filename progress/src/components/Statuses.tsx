import { DataStatuses } from "../utils/processdatastatuses";
import { ImplementationStatuses } from "./MainContainer";
import Grid from "@mui/material/Unstable_Grid2";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

type StatusesProps = {
	dataStatuses: DataStatuses;
	implementationStatus: ImplementationStatuses[];
	setImplementationStatus: React.Dispatch<
		React.SetStateAction<ImplementationStatuses[]>
	>;
};

function Statuses({
	dataStatuses,
	implementationStatus,
	setImplementationStatus,
}: StatusesProps) {
	const total = Object.values(dataStatuses).reduce(
		(acc, curr) => acc + curr,
		0
	);

	function handleClick(status: ImplementationStatuses) {
		setImplementationStatus(
			implementationStatus.includes(status)
				? implementationStatus.filter(e => status !== e)
				: [...implementationStatus, status]
		);
	}

	return (
		<Box
			mt={1}
			mb={1}
			ml={0}
		>
			<Stack
				direction="row"
				spacing={2}
			>
				{Object.entries(dataStatuses).map(([status, statusValue]) => (
					<Card
						key={status}
						variant="outlined"
						sx={{
							width: "45%",
							textAlign: "center",
						}}
					>
						<CardContent>
							<Typography
								variant="h6"
								gutterBottom
							>
								{status}
							</Typography>
							<Typography
								variant="body2"
								color="textSecondary"
							>
								{statusValue}
							</Typography>
						</CardContent>
						<CardActions>
							<Button
								size="small"
								onClick={() =>
									handleClick(
										status as ImplementationStatuses
									)
								}
							>
								{implementationStatus.includes(
									status as ImplementationStatuses
								)
									? "Remove"
									: "Add"}
							</Button>
						</CardActions>
					</Card>
				))}
			</Stack>
		</Box>
	);
}

export default Statuses;
