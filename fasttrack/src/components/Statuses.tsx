import React, { useState } from "react";
import type { DataStatuses } from "../utils/processdatastatuses";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import InfoIcon from "@mui/icons-material/Info";
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
	cardClassName: "amber" | "blue";
	isLast: boolean;
};

const {
	projectStatusDescription,
	submissionAndUnderApprovalProjects,
	implementationAndReportingProjects,
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
				pb={1}
				pt={2}
				container
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
			</Grid>
			<Grid
				container
				justifyContent={"flex-end"}
			>
				<Box className="status-legend">
					<Box className="status-legend-pill status-lp-amber">
						{/* <span className="status-lp-dot status-lpd-amber"></span> */}
						<InfoIcon
							data-tooltip-id="tooltip"
							data-tooltip-html={
								"<div style='text-align: left;'>These are the statuses in the 'Submission and Under Approval' category:<ul style='margin-top: 10px; padding-left: 20px; list-style-type: disc;'><li>Submission of Proposal</li><li>Under Review</li><li>Under Final Approval</li></ul></div>"
							}
							data-tooltip-place="top"
							style={{
								fontSize: "16px",
								alignSelf: "flex-start",
							}}
						/>
						Submission and under approval
					</Box>
					<Box className="status-legend-pill status-lp-blue">
						{/* <span className="status-lp-dot status-lpd-blue"></span> */}
						<InfoIcon
							data-tooltip-id="tooltip"
							data-tooltip-html={
								"<div style='text-align: left;'>These are the statuses in the 'Implementation and Reporting' category:<ul style='margin-top: 10px; padding-left: 20px; list-style-type: disc;'><li>Under Implementation</li><li>Final Reporting</li><li>Project Closure</li></ul></div>"
							}
							data-tooltip-place="top"
							style={{
								fontSize: "16px",
								alignSelf: "flex-start",
							}}
						/>
						Implementation and reporting
					</Box>
				</Box>
			</Grid>
			{submissionAndUnderApprovalKeys.length > 0 && (
				<>
					<Box sx={{ width: "100%" }}>
						<Box className="status-section-divider">
							<Box className="status-divider-label">
								Submission and under approval
							</Box>
							<Box className="status-divider-line status-dline-amber"></Box>
						</Box>
					</Box>
					<Grid
						container
						mb={2}
						style={{
							display: "inline-flex",
							width:
								submissionAndUnderApprovalKeys.length >= 3
									? "100%"
									: `${(submissionAndUnderApprovalKeys.length / 3) * 100}%`,
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
									cardClassName="amber"
									isLast={index === 2}
								/>
							);
						})}
					</Grid>
				</>
			)}
			{implementationAndReportingKeys.length > 0 && (
				<>
					<Box sx={{ width: "100%" }}>
						<Box className="status-section-divider">
							<Box className="status-divider-label">
								Implementation and reporting
							</Box>
							<Box className="status-divider-line status-dline-blue"></Box>
						</Box>
					</Box>
					<Grid
						container
						style={{
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
									cardClassName="blue"
									isLast={index === 2}
								/>
							);
						})}
					</Grid>
				</>
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
	cardClassName,
	isLast,
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
				width: "32%",
				marginRight: isLast ? 0 : 1.5,
				flex: "1 1 auto",
				borderRadius: "8px",
				background: statusSelected
					? cardClassName === "amber"
						? "#fffdf8"
						: "#f7fbff"
					: "#fafafa",
				border: statusSelected
					? cardClassName === "amber"
						? "1px solid #fac775"
						: "1px solid #b5d4f4"
					: "1px solid #ccc",
			}}
		>
			<CardContent>
				<Box
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
					}}
					mb={1}
				>
					<Grid
						sx={{
							opacity: statusSelected ? 1 : 0.5,
							filter: statusSelected ? "none" : "grayscale(100%)",
						}}
						size={9}
					>
						<Typography
							variant="h6"
							fontSize={"1em"}
						>
							{
								<InfoIcon
									data-tooltip-id="tooltip"
									data-tooltip-content={description}
									data-tooltip-place="top"
									style={{
										color: "#666",
										fontSize: "18px",
										marginRight: "0.3em",
									}}
								/>
							}
							{title}
						</Typography>
					</Grid>
					<Grid
						size={3}
						justifyContent={"flex-end"}
					>
						<Box
							onClick={() => handleClick(statusType)}
							className={`status-remove-btn status-rb-${cardClassName}`}
							display={"flex"}
							justifyContent={"center"}
						>
							{statusSelected ? "Remove" : "Add"}
						</Box>
					</Grid>
				</Box>
				<Typography
					sx={{
						opacity: statusSelected ? 1 : 0.5,
						filter: statusSelected ? "none" : "grayscale(100%)",
					}}
					data-tooltip-id="tooltip"
					data-tooltip-content={`${title}: $${statusValue.toLocaleString()}`}
					data-tooltip-place="top"
					className={`status-cv-${cardClassName}`}
					style={{
						fontSize: "43px",
						fontWeight: 500,
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
					sx={{
						opacity: statusSelected ? 1 : 0.5,
						filter: statusSelected ? "none" : "grayscale(100%)",
					}}
					mt={1}
					className="status-card-footer"
					data-tooltip-id="tooltip"
					data-tooltip-content={`The total amount of allocations for ${title} projects is $${toLocaleFixed(
						statusValue,
						0,
						2,
					)}, which represents ${(
						(statusValue / total) *
						100
					).toFixed(
						2,
					)}% of the total allocations for all statuses (${toLocaleFixed(
						total,
						0,
						2,
					)}).`}
					data-tooltip-place="top"
				>
					<Box
						className={`status-prog-track status-pt-${cardClassName}`}
					>
						<Box
							className={`status-prog-fill status-pf-${cardClassName}`}
							style={{
								width: scale(statusValue) + "%",
								transitionProperty: "width",
								transitionDuration: "0.75s",
							}}
						></Box>
					</Box>
					<Box className={`status-pct status-pct-${cardClassName}`}>
						<Typography fontWeight={500}>
							<NumberAnimator
								number={parseFloat(
									((statusValue / total) * 100).toFixed(1),
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
