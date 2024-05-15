import { DataStatuses } from "../utils/processdatastatuses";
import { ImplementationStatuses } from "./MainContainer";
import Grid from "@mui/material/Unstable_Grid2";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InfoIcon from "@mui/icons-material/Info";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import colors from "../utils/colors";
import NumberAnimator from "./NumberAnimator";
import { scaleLinear } from "d3";
import toLocaleFixed from "../utils/localefixed";

type StatusesProps = {
	dataStatuses: DataStatuses;
	implementationStatus: ImplementationStatuses[];
	setImplementationStatus: React.Dispatch<
		React.SetStateAction<ImplementationStatuses[]>
	>;
};

type StatusProps = {
	handleClick: (status: ImplementationStatuses) => void;
	status: string;
	statusValue: number;
	total: number;
	implementationStatus: ImplementationStatuses[];
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
		<Box sx={{ width: "100%", zIndex: 100 }}>
			<Grid
				pb={2}
				pt={2}
				xs={12}
				display={"flex"}
				alignItems={"center"}
				justifyContent={"flex-start"}
			>
				<Typography
					variant={"h6"}
					style={{
						color: "darkslategray",
					}}
				>
					Implementation Statuses
				</Typography>
				<InfoIcon
					data-tooltip-id="tooltip"
					data-tooltip-html={
						"These are the tree statuses of the projects: implemented, under implementation, and closed/under closure.<br>Click the minus (-) button to remove a status from the calculated values, or plus (+) to add it back."
					}
					data-tooltip-place="top"
					style={{
						color: colors.unColor,
						fontSize: "18px",
						marginLeft: "0.2em",
						alignSelf: "flex-start",
					}}
				/>
			</Grid>
			<Grid
				container
				gap={2}
				sx={{
					width: "100%",
					flexWrap: "nowrap",
				}}
			>
				{Object.entries(dataStatuses).map(([status, statusValue]) => (
					<Status
						key={status}
						handleClick={handleClick}
						status={status}
						statusValue={statusValue}
						total={total}
						implementationStatus={implementationStatus}
					/>
				))}
			</Grid>
		</Box>
	);
}

function Status({
	handleClick,
	status,
	statusValue,
	total,
	implementationStatus,
}: StatusProps) {
	const scale = scaleLinear<number, number>()
		.domain([0, total])
		.range([0, 100]);

	const limitValue = 90;

	const statusSelected = implementationStatus.includes(
		status as ImplementationStatuses
	);

	return (
		<Grid xs={4}>
			<Card
				key={status}
				variant="outlined"
				sx={{
					flexGrow: 1,
					flex: "1 0 auto",
					borderColor: statusSelected ? colors.contrastColor : null,
				}}
			>
				<CardContent sx={{ padding: "8px 18px 8px 18px" }}>
					<Grid
						container
						alignItems={"center"}
					>
						<Grid xs={8}>
							<Typography
								variant="h6"
								fontSize={"1em"}
								gutterBottom
							>
								{status}
							</Typography>
						</Grid>
						<Grid
							container
							xs={4}
							alignSelf={"flex-start"}
							justifyContent={"flex-end"}
						>
							<CardActions>
								<IconButton
									size="small"
									style={{
										color: colors.unColor,
									}}
									onClick={() =>
										handleClick(
											status as ImplementationStatuses
										)
									}
								>
									{statusSelected ? (
										<RemoveCircleIcon />
									) : (
										<AddCircleIcon />
									)}
								</IconButton>
							</CardActions>
						</Grid>
					</Grid>
					<Typography
						variant="h4"
						color={colors.unColor}
						style={{
							opacity: statusSelected ? 1 : 0.75,
							filter: statusSelected ? "none" : "grayscale(100%)",
						}}
					>
						{"$"}
						<NumberAnimator
							number={Math.floor(statusValue)}
							type="integer"
						/>
					</Typography>
					<Box
						mt={2}
						mb={0}
						style={{
							display: "flex",
							alignItems: "center",
							width: "100%",
							opacity: statusSelected ? 1 : 0.75,
							filter: statusSelected ? "none" : "grayscale(100%)",
						}}
						data-tooltip-id="tooltip"
						data-tooltip-content={`The total amount of allocations for ${status} projects is $${toLocaleFixed(
							statusValue,
							0,
							2
						)}, which represents ${(
							(statusValue / total) *
							100
						).toFixed(
							1
						)}% of the total allocations for all statuses (${toLocaleFixed(
							total,
							0,
							2
						)}).`}
						data-tooltip-place="top"
					>
						<Box
							style={{
								width: scale(statusValue) + "%",
								minWidth: "1px",
								height: "18px",
								transitionProperty: "width",
								transitionDuration: "0.75s",
								display: "flex",
								alignItems: "center",
								backgroundColor: colors.contrastColorDarker,
							}}
						>
							<Typography
								fontSize={12}
								fontWeight={700}
								style={{
									position: "relative",
									left:
										scale(statusValue) < limitValue
											? "3px"
											: "-3px",
									marginLeft:
										scale(statusValue) < limitValue
											? "100%"
											: "auto",
									color:
										scale(statusValue) < limitValue
											? "#444"
											: "#fff",
								}}
							>
								<NumberAnimator
									number={parseFloat(
										((statusValue / total) * 100).toFixed(2)
									)}
									type="decimal"
								/>
								{"%"}
							</Typography>
						</Box>
					</Box>
				</CardContent>
			</Card>
		</Grid>
	);
}

export default Statuses;
