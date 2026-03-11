import React, { useState } from "react";
import type { DataStatuses } from "../utils/processdatastatuses";
import type { Statuses } from "./MainContainer";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InfoIcon from "@mui/icons-material/Info";
import colors from "../utils/colors";
import NumberAnimator from "./NumberAnimator";
import { scaleLinear } from "d3";
import toLocaleFixed from "../utils/localefixed";
import formatSIFloat from "../utils/formatsi";
import Snack from "./Snack";
import { constants } from "../utils/constants";

type ProjectStatusesProps = {
	dataStatuses: DataStatuses;
	status: Statuses[];
	setStatus: React.Dispatch<React.SetStateAction<Statuses[]>>;
};

type StatusProps = {
	handleClick: (thisStatus: Statuses) => void;
	statusType: Statuses;
	statusValue: number;
	total: number;
	status: Statuses[];
};

type StatusesDescription = {
	[K in Statuses]: string;
};

const statusesDescription: StatusesDescription = {
	"0": "Project(s) which have not being approved by CBPF at the current date",
	"1": "Project(s) which have already been approved by CBPF at the current date",
};

const { limitScaleValueInPixels, projectStatus } = constants;

function ProjectStatuses({
	dataStatuses,
	status,
	setStatus,
}: ProjectStatusesProps) {
	const [openSnack, setOpenSnack] = useState<boolean>(false);

	const total = Object.values(dataStatuses).reduce(
		(acc, curr) => acc + curr,
		0,
	);

	function handleClick(thisStatus: Statuses) {
		if (status.length === 1 && status.includes(thisStatus)) {
			setOpenSnack(true);
			return;
		}
		setStatus(
			status.includes(thisStatus)
				? status.filter(e => thisStatus !== e)
				: [...status, thisStatus],
		);
	}

	return (
		<Box
			mb={6}
			sx={{ width: "100%" }}
		>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one implementation status must be selected`}
			/>
			<Grid
				pb={2}
				pt={2}
				size={12}
				display={"flex"}
				alignItems={"center"}
				justifyContent={"center"}
			>
				<Typography
					mb={1}
					style={{
						color: "var(--ocha-blue)",
						fontWeight: 700,
						textAlign: "center",
						fontSize: "2rem",
						fontFamily: "Montserrat",
					}}
				>
					Implementation Statuses
				</Typography>
				<InfoIcon
					data-tooltip-id="tooltip"
					data-tooltip-html={
						"Projects can be at two different stages: <br />1. Under approval by CBPF <br />2. Approved by CBPF"
					}
					data-tooltip-place="top"
					style={{
						color: "#666",
						fontSize: "20px",
						marginLeft: "0.1em",
						alignSelf: "flex-start",
						marginTop: "-0.1em",
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
				{Object.entries(dataStatuses).map(
					([statusType, statusValue]) => (
						<Status
							key={statusType}
							handleClick={handleClick}
							statusType={+statusType as Statuses}
							statusValue={statusValue}
							total={total}
							status={status}
						/>
					),
				)}
			</Grid>
		</Box>
	);
}

function Status({
	handleClick,
	statusType,
	statusValue,
	total,
	status,
}: StatusProps) {
	const scale = scaleLinear<number, number>()
		.domain([0, total])
		.range([0, 100]);

	const statusSelected = status.includes(statusType);

	const title = projectStatus.find(d => d.value === statusType)?.label;

	return (
		<Grid size={6}>
			<Card
				key={statusType}
				variant="outlined"
				sx={{
					flexGrow: 1,
					flex: "1 0 auto",
					borderColor: statusSelected ? colors.unColor : null,
				}}
			>
				<CardContent sx={{ padding: "8px 18px 8px 18px" }}>
					<Grid
						container
						alignItems={"center"}
					>
						<Grid
							size={8}
							container
						>
							<Typography
								variant="h6"
								fontSize={"1em"}
								gutterBottom
							>
								{title}
							</Typography>
							<InfoIcon
								data-tooltip-id="tooltip"
								data-tooltip-content={
									statusesDescription[statusType]
								}
								data-tooltip-place="top"
								style={{
									color: "#666",
									fontSize: "16px",
									marginLeft: "0.1em",
									alignSelf: "flex-start",
									marginTop: "-0.1em",
								}}
							/>
						</Grid>
						<Grid
							container
							size={4}
							alignSelf={"flex-start"}
							justifyContent={"flex-end"}
						>
							<CardActions>
								<Button
									size="small"
									style={{
										backgroundColor: "whitesmoke",
									}}
									variant="text"
									onClick={() => handleClick(statusType)}
								>
									{statusSelected ? "Remove" : "Add"}
								</Button>
							</CardActions>
						</Grid>
					</Grid>
					<Typography
						data-tooltip-id="tooltip"
						data-tooltip-content={`${title}: $${statusValue.toLocaleString()}`}
						data-tooltip-place="top"
						color={colors.unColor}
						style={{
							fontSize: "2.5em",
							fontWeight: 500,
							display: "inline-block",
							opacity: statusSelected ? 1 : 0.75,
							filter: statusSelected ? "none" : "grayscale(100%)",
						}}
					>
						{"$"}
						{statusValue < 1e3 ? (
							<NumberAnimator
								number={Math.floor(statusValue)}
								type="integer"
							/>
						) : (
							<span>
								<NumberAnimator
									number={parseFloat(
										formatSIFloat(statusValue),
									)}
									type="decimal"
								/>
								{formatSIFloat(statusValue).slice(-1)}
							</span>
						)}
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
						data-tooltip-content={`The total amount of allocations for ${title} projects is $${toLocaleFixed(
							statusValue,
							0,
							2,
						)}, which represents ${(
							(statusValue / total) *
							100
						).toFixed(
							1,
						)}% of the total allocations for all statuses (${toLocaleFixed(
							total,
							0,
							2,
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
								backgroundColor: colors.unColorDarker,
							}}
						>
							<Typography
								fontSize={12}
								fontWeight={700}
								style={{
									position: "relative",
									left:
										scale(statusValue) <
										limitScaleValueInPixels
											? "3px"
											: "-3px",
									marginLeft:
										scale(statusValue) <
										limitScaleValueInPixels
											? "100%"
											: "auto",
									color:
										scale(statusValue) <
										limitScaleValueInPixels
											? "#444"
											: "#fff",
								}}
							>
								<NumberAnimator
									number={parseFloat(
										((statusValue / total) * 100).toFixed(
											2,
										),
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

const MemoisedProjectStatuses = React.memo(ProjectStatuses);

export default MemoisedProjectStatuses;
