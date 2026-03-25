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
import type { List } from "../utils/makelists";

type ProjectStatusesProps = {
	dataStatuses: DataStatuses;
	status: number[];
	setStatus: React.Dispatch<React.SetStateAction<number[]>>;
	lists: List;
};

type StatusProps = {
	handleClick: (thisStatus: number) => void;
	statusType: number;
	statusValue: number;
	total: number;
	status: number[];
	title: string;
	description: string;
};

const {
	limitScaleValueInPixels,
	projectStatusDescription,
	submissionAndUnderApprovalProjects,
	submissionAndUnderApprovalProjectsColor,
	implementationAndReportingProjects,
	implementationAndReportingProjectsColor,
} = constants;

function ProjectStatuses({
	dataStatuses,
	status,
	setStatus,
	lists,
}: ProjectStatusesProps) {
	const [openSnack, setOpenSnack] = useState<boolean>(false);

	const total = Object.values(dataStatuses).reduce(
		(acc, curr) => acc + curr,
		0,
	);

	const dataStatusesKeys = Object.keys(dataStatuses).map((d: string) => +d);

	const submissionAndUnderApprovalKeys = dataStatusesKeys.filter(d =>
		(submissionAndUnderApprovalProjects as readonly number[]).includes(d),
	);

	const implementationAndReportingKeys = dataStatusesKeys.filter(d =>
		(implementationAndReportingProjects as readonly number[]).includes(d),
	);

	function handleClick(thisStatus: number) {
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
			mb={8}
			mt={3}
			display={"flex"}
			flexDirection={"column"}
		>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one implementation status must be selected`}
			/>
			<Grid
				pb={4}
				pt={2}
				container
				justifyContent={"center"}
			>
				<Box sx={{ flex: 1 }} />
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
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
						Project Statuses
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
				</Box>
				<Box
					sx={{
						flex: 1,
						display: "flex",
						justifyContent: "flex-end",
					}}
				>
					<Box
						style={{
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Box
							style={{
								borderRadius: "8px",
								backgroundColor:
									submissionAndUnderApprovalProjectsColor,
								display: "flex",
								flexDirection: "row",
								padding: "0.25rem 0.5rem",
							}}
							mb={1}
						>
							<Typography
								style={{
									fontWeight: 700,
									textAlign: "center",
									fontSize: "0.8rem",
									fontFamily: "Montserrat",
								}}
							>
								{" "}
								Submission and Under Approval
							</Typography>
							<InfoIcon
								data-tooltip-id="tooltip"
								data-tooltip-html={
									"<div style='text-align: left;'>These are the statuses in the 'Submission and Under Approval' category:<ul style='margin-top: 10px; padding-left: 20px; list-style-type: disc;'><li>Submission of Proposal</li><li>Under Review</li><li>Under Final Approval</li></ul></div>"
								}
								data-tooltip-place="top"
								style={{
									color: "#666",
									fontSize: "14px",
									marginLeft: "0.1em",
									alignSelf: "flex-start",
									marginTop: "-0.1em",
								}}
							/>
						</Box>
						<Box
							style={{
								borderRadius: "8px",
								backgroundColor:
									implementationAndReportingProjectsColor,
								display: "flex",
								flexDirection: "row",
								padding: "0.25rem 0.5rem",
							}}
						>
							<Typography
								style={{
									fontWeight: 700,
									textAlign: "center",
									fontSize: "0.8rem",
									fontFamily: "Montserrat",
								}}
							>
								Implementation and Reporting
							</Typography>
							<InfoIcon
								data-tooltip-id="tooltip"
								data-tooltip-html={
									"<div style='text-align: left;'>These are the statuses in the 'Implementation and Reporting' category:<ul style='margin-top: 10px; padding-left: 20px; list-style-type: disc;'><li>Under Implementation</li><li>Final Reporting</li><li>Project Closure</li></ul></div>"
								}
								data-tooltip-place="top"
								style={{
									color: "#666",
									fontSize: "14px",
									marginLeft: "0.1em",
									alignSelf: "flex-start",
									marginTop: "-0.1em",
								}}
							/>
						</Box>
					</Box>
				</Box>
			</Grid>
			{submissionAndUnderApprovalKeys.length > 0 && (
				<Grid
					container
					spacing={2}
					style={{
						backgroundColor:
							submissionAndUnderApprovalProjectsColor,
						padding: "1em",
						borderRadius: "8px",
						display: "inline-flex",
						width:
							submissionAndUnderApprovalKeys.length >= 3
								? "100%"
								: `${(submissionAndUnderApprovalKeys.length / 3) * 100}%`,
						marginBottom: "1em",
					}}
					// alignItems={"stretch"}
				>
					{submissionAndUnderApprovalKeys.map((datum, index) => {
						return (
							<Status
								key={index}
								handleClick={handleClick}
								statusType={datum}
								statusValue={dataStatuses[datum]}
								total={total}
								status={status}
								title={lists.projectStatus[datum]}
								description={
									(
										projectStatusDescription as Record<
											number,
											string
										>
									)[datum]
								}
							/>
						);
					})}
				</Grid>
			)}
			{implementationAndReportingKeys.length > 0 && (
				<Grid
					container
					spacing={2}
					style={{
						backgroundColor:
							implementationAndReportingProjectsColor,
						padding: "1em",
						borderRadius: "8px",
						display: "inline-flex",
						width:
							implementationAndReportingKeys.length >= 3
								? "100%"
								: `${(implementationAndReportingKeys.length / 3) * 100}%`,
					}}
					// alignItems={"stretch"}
				>
					{implementationAndReportingKeys.map((datum, index) => {
						return (
							<Status
								key={index}
								handleClick={handleClick}
								statusType={datum}
								statusValue={dataStatuses[datum]}
								total={total}
								status={status}
								title={lists.projectStatus[datum]}
								description={
									(
										projectStatusDescription as Record<
											number,
											string
										>
									)[datum]
								}
							/>
						);
					})}
				</Grid>
			)}
		</Box>
	);
}

function Status({
	handleClick,
	statusType,
	statusValue,
	total,
	status,
	title,
	description,
}: StatusProps) {
	const scale = scaleLinear<number, number>()
		.domain([0, total])
		.range([0, 100]);

	const statusSelected = status.includes(statusType);

	return (
		<Card
			key={title}
			variant="outlined"
			sx={{
				width: "30%",
				flex: "1 1 auto",
				borderColor: statusSelected ? "#bbb" : null,
				backgroundColor: "white",
				filter: statusSelected ? "none" : "grayscale(100%)",
			}}
		>
			<CardContent
				sx={{
					padding: "8px 18px 8px 18px",
					height: "100%",
					opacity: statusSelected ? 1 : 0.6,
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
						size={8}
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
									data-tooltip-content={description}
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
								number={parseFloat(formatSIFloat(statusValue))}
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
									scale(statusValue) < limitScaleValueInPixels
										? "3px"
										: "-3px",
								marginLeft:
									scale(statusValue) < limitScaleValueInPixels
										? "100%"
										: "auto",
								color:
									scale(statusValue) < limitScaleValueInPixels
										? "#444"
										: "#fff",
							}}
						>
							<NumberAnimator
								number={parseFloat(
									((statusValue / total) * 100).toFixed(2),
								)}
								type="decimal"
							/>
							{"%"}
						</Typography>
					</Box>
				</Box>
			</CardContent>
		</Card>
	);
}

const MemoisedProjectStatuses = React.memo(ProjectStatuses);

export default MemoisedProjectStatuses;
