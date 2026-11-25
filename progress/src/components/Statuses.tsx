import { useState } from "react";
import {
	DataStatuses,
	DataStatusesBeneficiaries,
} from "../utils/processdatastatuses";
import { ImplementationStatuses } from "./MainContainer";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
// import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
// import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InfoIcon from "@mui/icons-material/Info";
// import colors from "../utils/colors";
import NumberAnimator from "./NumberAnimator";
import { scaleLinear } from "d3";
import toLocaleFixed from "../utils/localefixed";
import formatSIFloat from "../utils/formatsi";
import Snack from "./Snack";
import constants from "../utils/constants";
import { projectStatusMaster } from "../utils/constants";

type StatusesProps = {
	dataStatuses: DataStatuses;
	dataStatusesBeneficiaries: DataStatusesBeneficiaries;
	implementationStatus: ImplementationStatuses[];
	setImplementationStatus: React.Dispatch<
		React.SetStateAction<ImplementationStatuses[]>
	>;
};

type StatusProps = {
	handleClick: (status: ImplementationStatuses) => void;
	status: ImplementationStatuses;
	statusValue: number;
	targeted: number;
	reached: number;
	total: number;
	implementationStatus: ImplementationStatuses[];
	cardClassName: "amber" | "blue";
};

type StatusesDescription = {
	[K in ImplementationStatuses]: string;
};

const statusesDescription: StatusesDescription = {
	"Submission of Proposal": "Submission of Proposal",
	"Under Review": "Under Review",
	"Under Final Approval": "Under Final Approval",
	"Under Implementation": "Under Implementation",
	"Final Reporting": "Final Reporting",
	"Project Closure": "Project Closure",
};

const {
	opacityValue,
	submissionAndUnderApprovalProjects,
	implementationAndReportingProjects,
} = constants;

function Statuses({
	dataStatuses,
	dataStatusesBeneficiaries,
	implementationStatus,
	setImplementationStatus,
}: StatusesProps) {
	const [openSnack, setOpenSnack] = useState<boolean>(false);

	const total = Object.values(dataStatuses).reduce(
		(acc, curr) => acc + curr,
		0,
	);

	const dataStatusesArray = Object.entries(dataStatuses) as [
		keyof typeof dataStatuses,
		number,
	][];

	const submissionAndUnderApproval = dataStatusesArray.filter(d =>
		submissionAndUnderApprovalProjects.some(
			statusNumber =>
				projectStatusMaster[statusNumber] === d[0] && d[1] > 0,
		),
	);

	const implementationAndReporting = dataStatusesArray.filter(d =>
		implementationAndReportingProjects.some(
			statusNumber =>
				projectStatusMaster[statusNumber] === d[0] && d[1] > 0,
		),
	);

	function handleClick(status: ImplementationStatuses) {
		if (
			implementationStatus.length === 1 &&
			implementationStatus.includes(status)
		) {
			setOpenSnack(true);
			return;
		}
		setImplementationStatus(
			implementationStatus.includes(status)
				? implementationStatus.filter(e => status !== e)
				: [...implementationStatus, status],
		);
	}

	return (
		<Box sx={{ width: "100%", zIndex: 100 }}>
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
					style={{
						color: "var(--ocha-blue)",
						fontWeight: 700,
						textAlign: "center",
						fontSize: "1.5rem",
						fontFamily: "Montserrat",
					}}
				>
					Implementation Statuses
				</Typography>
				<InfoIcon
					data-tooltip-id="tooltip"
					data-tooltip-html={
						"Projects can fall into different implementation statuses.<br>Click 'Remove' to exclude a status from the calculated values, or 'Add' to include it back."
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
			<Grid
				container
				spacing={1}
				sx={{
					width: "100%",
				}}
			>
				{submissionAndUnderApproval.length > 0 && (
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
							spacing={1.5}
							mb={2}
							style={{
								display: "inline-flex",
								width: "100%",
							}}
							// alignItems={"stretch"}
						>
							{submissionAndUnderApproval.map(
								([status, statusValue]) => (
									<Status
										key={status}
										handleClick={handleClick}
										status={status}
										statusValue={statusValue}
										targeted={
											dataStatusesBeneficiaries[status]
												?.targeted ?? 0
										}
										reached={
											dataStatusesBeneficiaries[status]
												?.reached ?? 0
										}
										total={total}
										implementationStatus={
											implementationStatus
										}
										cardClassName="amber"
									/>
								),
							)}
						</Grid>
					</>
				)}
				{implementationAndReporting.length > 0 && (
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
							spacing={1.5}
							style={{
								display: "inline-flex",
								width: "100%",
							}}
							// alignItems={"stretch"}
						>
							{implementationAndReporting.map(
								([status, statusValue]) => (
									<Status
										key={status}
										handleClick={handleClick}
										status={status}
										statusValue={statusValue}
										targeted={
											dataStatusesBeneficiaries[status]
												?.targeted ?? 0
										}
										reached={
											dataStatusesBeneficiaries[status]
												?.reached ?? 0
										}
										total={total}
										implementationStatus={
											implementationStatus
										}
										cardClassName="blue"
									/>
								),
							)}
						</Grid>
					</>
				)}
			</Grid>
		</Box>
	);
}

function Status({
	handleClick,
	status,
	statusValue,
	targeted,
	reached,
	total,
	implementationStatus,
	cardClassName,
}: StatusProps) {
	const scale = scaleLinear<number, number>()
		.domain([0, total])
		.range([0, 100]);

	const statusSelected = implementationStatus.includes(status);

	return (
		<Grid size={4}>
			<Card
				variant="outlined"
				sx={{
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
						: "1px solid #ddd",
					boxShadow: statusSelected
						? "0 0 6px rgba(0, 0, 0, 0.2)"
						: "none",
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
								opacity: statusSelected ? 1 : opacityValue,
								filter: statusSelected
									? "none"
									: "grayscale(100%)",
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
										data-tooltip-content={
											statusesDescription[status]
										}
										data-tooltip-place="top"
										style={{
											color: "#666",
											fontSize: "18px",
											marginRight: "0.3em",
										}}
									/>
								}
								{status}
							</Typography>
						</Grid>
						<Grid
							size={3}
							justifyContent={"flex-end"}
						>
							<Box
								onClick={() => handleClick(status)}
								className={`status-remove-btn status-rb-${cardClassName}`}
								display={"flex"}
								justifyContent={"center"}
							>
								{statusSelected ? "Remove" : "Add"}
							</Box>
						</Grid>
					</Box>
					<Box
						className="status-card-mid"
						sx={{
							opacity: statusSelected ? 1 : opacityValue,
							filter: statusSelected ? "none" : "grayscale(100%)",
						}}
					>
						<Typography
							data-tooltip-id="tooltip"
							data-tooltip-content={`${status}: $${statusValue.toLocaleString()}`}
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
										number={parseFloat(
											formatSIFloat(statusValue),
										)}
										type="decimal"
									/>
									{formatSIFloat(statusValue).slice(-1)}
								</span>
							)}
						</Typography>
						{(targeted > 0 || reached > 0) && (
							<Box
								className="status-card-people"
								data-tooltip-id="tooltip"
								data-tooltip-html={[
									status,
									targeted > 0 &&
										`Targeted: ${targeted.toLocaleString()} people`,
									reached > 0 &&
										`Reached: ${reached.toLocaleString()} people`,
								]
									.filter(Boolean)
									.join("<br />")}
								data-tooltip-place="top"
							>
								<Box className="status-card-pt">
									{targeted > 0 && (
										<Box className="status-label-pt">
											<div className="status-label-pt-value status-label-pt-targeted">
												<NumberAnimator
													number={parseFloat(
														formatSIFloat(targeted),
													)}
													type="decimal"
												/>
												{getSuffix(targeted)}
											</div>
											<span>Targeted</span>
										</Box>
									)}
									{reached > 0 && (
										<Box className="status-label-pt">
											<div className="status-label-pt-value status-label-pt-reached">
												<NumberAnimator
													number={parseFloat(
														formatSIFloat(reached),
													)}
													type="decimal"
												/>
												{getSuffix(reached)}
											</div>
											<span>Reached</span>
										</Box>
									)}
								</Box>
							</Box>
						)}
					</Box>
					<Box
						sx={{
							opacity: statusSelected ? 1 : opacityValue,
							filter: statusSelected ? "none" : "grayscale(100%)",
						}}
						mt={1}
						className="status-card-footer"
						data-tooltip-id="tooltip"
						data-tooltip-content={`The total amount of allocations for ${status} projects is $${toLocaleFixed(
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
						<Box
							className={`status-pct status-pct-${cardClassName}`}
						>
							<Typography fontWeight={500}>
								<NumberAnimator
									number={parseFloat(
										((statusValue / total) * 100).toFixed(
											1,
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

//unit next to the people numbers (M, k...)
function getSuffix(value: number): string {
	const lastChar = formatSIFloat(value).slice(-1);
	return isNaN(+lastChar) ? lastChar : "";
}

export default Statuses;
