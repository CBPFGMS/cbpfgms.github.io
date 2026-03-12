import React, { useState } from "react";
import type { DataStatuses } from "../utils/processdatastatuses";
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
import type { InSelectionData } from "../utils/processdatatopfigures";

type ProjectStatusesProps = {
	dataStatuses: DataStatuses;
	status: number[];
	inSelectionData: InSelectionData;
	setStatus: React.Dispatch<React.SetStateAction<number[]>>;
};

type StatusType = (typeof projectStatusMaster)[number]["values"];

type StatusProps = {
	handleClick: (thisStatus: StatusType) => void;
	statusType: StatusType;
	statusValue: number;
	total: number;
	status: number[];
	statusDatum: (typeof projectStatusMaster)[number];
};

const { limitScaleValueInPixels, projectStatusMaster } = constants;

function ProjectStatuses({
	dataStatuses,
	status,
	setStatus,
	inSelectionData,
}: ProjectStatusesProps) {
	const [openSnack, setOpenSnack] = useState<boolean>(false);

	const total = Object.values(dataStatuses).reduce(
		(acc, curr) => acc + curr,
		0,
	);

	const statusesInData = projectStatusMaster.filter(d =>
		d.values.some(e => inSelectionData.statuses.has(e)),
	);

	function handleClick(thisStatus: StatusType) {
		const match =
			status.length === thisStatus.length &&
			status
				.slice()
				.sort()
				.every((val, index) => {
					return val === thisStatus.slice().sort()[index];
				});
		if (match) {
			setOpenSnack(true);
			return;
		}
		setStatus(prevStatus => {
			const toKeep = prevStatus.filter(
				item => !(thisStatus as readonly number[]).includes(item),
			);
			const toAdd = thisStatus.filter(item => !prevStatus.includes(item));
			return [...toKeep, ...toAdd];
		});
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
						"CBPF projects can be in different statuses. Click 'remove' or 'add' for filtering by implementation status"
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
				spacing={2}
				alignItems={"stretch"}
				sx={{
					width: "100%",
				}}
			>
				{statusesInData.map((statusDatum, index) => {
					const statusValue = statusDatum.values.reduce(
						(acc, curr) => acc + (dataStatuses[curr] || 0),
						0,
					);
					return (
						<Status
							key={index}
							handleClick={handleClick}
							statusType={statusDatum.values}
							statusValue={statusValue}
							total={total}
							status={status}
							statusDatum={statusDatum}
						/>
					);
				})}
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
	statusDatum,
}: StatusProps) {
	const scale = scaleLinear<number, number>()
		.domain([0, total])
		.range([0, 100]);

	const statusSelected = statusType.some(e => status.includes(e));

	const title = statusDatum.label;

	return (
		<Grid
			size={3}
			display={"flex"}
		>
			<Card
				key={title}
				variant="outlined"
				sx={{
					flex: "1 1 auto",
					borderColor: statusSelected ? colors.unColor : null,
				}}
			>
				<CardContent
					sx={{
						padding: "8px 18px 8px 18px",
						height: "100%",
					}}
				>
					<Box
						style={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
							height: "35%",
						}}
					>
						<Grid
							size={7}
							container
						>
							<Typography
								variant="h6"
								fontSize={"1em"}
								gutterBottom
							>
								{title}
								{
									<InfoIcon
										data-tooltip-id="tooltip"
										data-tooltip-content={
											statusDatum.description
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
								}
							</Typography>
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
					</Box>
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
