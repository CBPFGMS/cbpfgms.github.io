import React, { useContext, useRef } from "react";
import { DownloadStates, ImplementationStatuses } from "./MainContainer";
import constants from "../utils/constants";
import DataContext, { DataContextType } from "../context/DataContext";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { max, format } from "d3";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import colors from "../utils/colors";
import DisabilityChartRow from "./DisabilityChartRow";
import { processDisabilityDownload } from "../utils/processdownload";
import downloadData from "../utils/downloaddata";
import DownloadAndImageContainer from "./DownloadAndImageContainer";
import NumberAnimator from "./NumberAnimator";
import formatSIFloat from "../utils/formatsi";
import Divider from "@mui/material/Divider";
import { TargetedAndReachedTotal } from "../utils/processdatatotalben";
import { Report } from "../utils/processdatasummary";

type DisabilityChartProps = {
	targetedAndReachedTotalByDisability: TargetedAndReachedTotal;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationStatus: ImplementationStatuses[];
	disabilityReports: Report;
};

const { beneficiaryCategories } = constants;

function DisabilityChart({
	targetedAndReachedTotalByDisability,
	clickedDownload,
	setClickedDownload,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
	disabilityReports,
}: DisabilityChartProps) {
	const { data, lists } = useContext(DataContext) as DataContextType;

	const totalTargeted = targetedAndReachedTotalByDisability.targeted.total;
	const totalReached = targetedAndReachedTotalByDisability.reached.total;

	const maxValue =
		max(
			beneficiaryCategories.map(type =>
				Math.max(
					targetedAndReachedTotalByDisability.targeted[type],
					targetedAndReachedTotalByDisability.reached[type],
				),
			),
		) || 0;

	const ref = useRef<HTMLDivElement>(null);

	function handleDownloadClick() {
		const dataDisabilityDownload = processDisabilityDownload({
			data,
			lists,
			year,
			fund,
			allocationSource,
			allocationType,
			implementationStatus,
		});
		downloadData<(typeof dataDisabilityDownload)[number]>(
			dataDisabilityDownload,
			"people_with_disability",
		);
	}

	return (
		<Container
			disableGutters={true}
			style={{
				position: "relative",
			}}
			ref={ref}
		>
			<DownloadAndImageContainer
				handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type="disability"
				refElement={ref}
				fileName="people_with_disability"
			/>
			<Box
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "58px",
					flexDirection: "column",
				}}
			>
				<Typography
					style={{
						fontSize: "1rem",
						fontWeight: 500,
						textTransform: "uppercase",
					}}
				>
					Persons with disabilities, Targeted and Reached
				</Typography>
			</Box>
			<Box
				display={"flex"}
				flexDirection={"row"}
				alignItems={"center"}
				justifyContent={"center"}
				gap={2}
				marginBottom={4}
				width={"100%"}
			>
				<Box
					display={"flex"}
					flexDirection={"column"}
					alignItems={"center"}
					justifyContent={"center"}
					gap={0}
					data-tooltip-id="tooltip"
					data-tooltip-content={`Persons with disabilities, targeted: ${format(
						",.0f",
					)(totalTargeted)}`}
					data-tooltip-place="top"
				>
					<Typography
						variant="h3"
						fontWeight={500}
						style={{ color: colors.contrastColor, border: "none" }}
					>
						{totalTargeted < 1e3 ? (
							<NumberAnimator
								number={totalTargeted}
								type="integer"
							/>
						) : (
							<span>
								<NumberAnimator
									number={parseFloat(
										formatSIFloat(totalTargeted),
									)}
									type="decimal"
								/>
								{formatSIFloat(totalTargeted).slice(-1)}
							</span>
						)}
					</Typography>
					<Typography
						noWrap={true}
						style={{
							fontSize: 18,
							color: colors.contrastColorDarker,
							display: "flex",
							alignItems: "center",
							textAlign: "center",
							lineHeight: 1.2,
						}}
					>
						People with{<br />}disabilities, Targeted
						<AdsClickIcon
							style={{
								fontSize: 18,
								marginLeft: 4,
								color: "#777",
								opacity: 0.6,
							}}
						/>
					</Typography>
				</Box>
				<Divider
					orientation="vertical"
					flexItem
					style={{
						borderLeft: "2px dotted #ccc",
						borderRight: "none",
					}}
				/>
				<Box
					display={"flex"}
					flexDirection={"column"}
					alignItems={"center"}
					justifyContent={"center"}
					gap={0}
					data-tooltip-id="tooltip"
					data-tooltip-content={`Persons with disabilities, reached: ${format(
						",.0f",
					)(totalReached)}`}
					data-tooltip-place="top"
				>
					<Typography
						noWrap={true}
						variant="h3"
						fontWeight={500}
						style={{ color: colors.unColor, border: "none" }}
					>
						{totalReached < 1e3 ? (
							<NumberAnimator
								number={totalReached}
								type="integer"
							/>
						) : (
							<span>
								<NumberAnimator
									number={parseFloat(
										formatSIFloat(totalReached),
									)}
									type="decimal"
								/>
								{formatSIFloat(totalReached).slice(-1)}
							</span>
						)}
						<span
							style={{
								color: "#666",
								fontSize: 14,
								fontStyle: "italic",
								marginLeft: "6px",
							}}
						>
							{"("}
							<NumberAnimator
								number={
									totalTargeted === 0
										? 0
										: ~~(
												(totalReached * 100) /
												totalTargeted
											)
								}
								type="integer"
							/>
							{"%)"}
						</span>
					</Typography>
					<Typography
						noWrap={true}
						style={{
							fontSize: 18,
							color: colors.unColor,
							display: "flex",
							alignItems: "center",
							textAlign: "center",
							lineHeight: 1.2,
						}}
					>
						People with{<br />}disabilities, Reached
						<DoneIcon
							style={{
								fontSize: 18,
								marginLeft: 4,
								color: "#777",
								opacity: 0.6,
							}}
						/>
					</Typography>
				</Box>
			</Box>
			<Box
				display={"flex"}
				flexDirection={"column"}
				width={"95%"}
				marginLeft={"3%"}
				alignItems={"center"}
				gap={2}
				marginTop={2}
			>
				<Box
					mb={-2}
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "flex-end",
						textAlign: "right",
						width: "100%",
					}}
				>
					<Typography
						variant="body2"
						fontSize={12}
						style={{
							color: "#222",
							border: "none",
							fontStyle: "italic",
							letterSpacing: "-0.05em",
						}}
					>
						Reached as %<br />
						of targeted
					</Typography>
				</Box>
				{beneficiaryCategories.map(type => (
					<DisabilityChartRow
						key={type}
						type={type}
						targeted={
							targetedAndReachedTotalByDisability.targeted[type]
						}
						reached={
							targetedAndReachedTotalByDisability.reached[type]
						}
						maxValue={maxValue}
					/>
				))}
			</Box>
			<Box
				width={"100%"}
				display={"flex"}
				justifyContent={"center"}
				mt={5}
			>
				<Typography
					variant="caption"
					sx={{ lineHeight: 1.2, width: "80%", fontStyle: "italic" }}
				>
					The data on people with disabilities reached, as reported in
					the latest programmatic reports, was identified from{" "}
					{format(".1~%")(
						disabilityReports.reportsWithData /
							disabilityReports.totalReports,
					)}{" "}
					of the projects.
				</Typography>
			</Box>
		</Container>
	);
}

const MemoisedDisabilityChart = React.memo(DisabilityChart);

export default MemoisedDisabilityChart;
