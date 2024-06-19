import { useContext } from "react";
import DataContext, { DataContextType } from "../context/DataContext";
import { DataLeadership } from "../utils/processdataorganizationleadership";
import { DownloadStates, ImplementationStatuses } from "./MainContainer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DownloadIcon from "./DownloadIcon";
import Container from "@mui/material/Container";
import NumberAnimator from "./NumberAnimator";
import { format } from "d3";
import formatSIFloat from "../utils/formatsi";
import LeadershipRow from "./LeadershipRow";
import constants from "../utils/constants";
import { processLeadershipDownload } from "../utils/processdownload";
import downloadData from "../utils/downloaddata";

type LeadershipChartProps = {
	dataLeadership: DataLeadership;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	implementationStatus: ImplementationStatuses[];
};

const { organizationLeadership } = constants;

function LeadershipChart({
	dataLeadership,
	clickedDownload,
	setClickedDownload,
	year,
	fund,
	allocationSource,
	allocationType,
	implementationStatus,
}: LeadershipChartProps) {
	const { data, lists } = useContext(DataContext) as DataContextType;

	function handleDownloadClick() {
		const dataLeadershipDownload = processLeadershipDownload({
			data,
			lists,
			year,
			fund,
			allocationSource,
			allocationType,
			implementationStatus,
		});
		downloadData<(typeof dataLeadershipDownload)[number]>(
			dataLeadershipDownload,
			"leadership_type"
		);
	}

	const leadershipData = dataLeadership.leadershipData.sort((a, b) => {
		const indexA = organizationLeadership.indexOf(a.type);
		const indexB = organizationLeadership.indexOf(b.type);
		return indexA - indexB;
	});

	return (
		<Container
			disableGutters={true}
			style={{
				position: "relative",
			}}
		>
			<DownloadIcon
				handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type="leadership"
			/>
			<Box
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "58px",
					flexDirection: "column",
				}}
				mb={2}
			>
				<Typography
					style={{
						fontSize: "1rem",
						fontWeight: 500,
						textTransform: "uppercase",
					}}
				>
					{"Allocations bY WLO, RLO, YLO and OPD partner types"}
				</Typography>
			</Box>
			<Box
				gap={2}
				marginTop={2}
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "flex-end",
					width: "95%",
					marginLeft: "3%",
				}}
			>
				<Box
					mb={2}
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "flex-end",
						width: "100%",
					}}
				>
					<Box
						mb={-2}
						style={{
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "center",
							width: "12%",
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
							Number of
							<br />
							Partners
						</Typography>
					</Box>
				</Box>
				<LeadershipTotal dataLeadership={dataLeadership} />
				{leadershipData.map((leaderData, i) => (
					<LeadershipRow
						key={i}
						type={leaderData.type}
						value={leaderData.allocations}
						partners={leaderData.partners.size}
						total={dataLeadership.totalAllocations}
						totalPartners={dataLeadership.totalPartners.size}
					/>
				))}
			</Box>
		</Container>
	);
}

function LeadershipTotal({
	dataLeadership,
}: {
	dataLeadership: DataLeadership;
}) {
	return (
		<Box
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				width: "100%",
			}}
			mb={2}
		>
			<Box
				style={{
					flex: "0 18%",
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-end",
					textAlign: "right",
					overflow: "hidden",
				}}
			>
				<Typography
					variant="body2"
					fontWeight={400}
					fontSize={13}
					style={{
						color: "#444",
						border: "none",
						paddingRight: "12px",
					}}
				>
					{"Total allocations"}
				</Typography>
			</Box>
			<Box
				style={{
					flex: "0 70%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Box
					style={{
						display: "flex",
						flexDirection: "row",
						width: "100%",
						alignItems: "center",
					}}
					data-tooltip-id="tooltip"
					data-tooltip-content={`Total allocated: $${format(",.0f")(
						dataLeadership.totalAllocations
					)}`}
					data-tooltip-place="top"
				>
					<Box
						style={{
							marginTop: "2px",
							marginBottom: "2px",
							display: "flex",
							alignItems: "center",
							width: "100%",
						}}
					>
						<Box
							style={{
								width: "100%",
								minWidth: "1px",
								height: "18px",
								display: "flex",
								alignItems: "center",
								backgroundColor: "#888",
							}}
						>
							<Typography
								fontSize={12}
								fontWeight={700}
								style={{
									position: "relative",
									left: "-3px",
									marginLeft: "auto",
									color: "#fff",
								}}
							>
								{"$"}
								<NumberAnimator
									number={parseFloat(
										formatSIFloat(
											dataLeadership.totalAllocations
										)
									)}
									type="decimal"
								/>
								{formatSIFloat(
									dataLeadership.totalAllocations
								).slice(-1)}
							</Typography>
						</Box>
					</Box>
				</Box>
			</Box>
			<Box
				style={{
					flex: "0 12%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Typography
					variant="body2"
					style={{
						fontSize: 12,
						color: "#444",
						border: "none",
						fontStyle: "italic",
					}}
				>
					<NumberAnimator
						number={~~dataLeadership.totalPartners.size}
						type="integer"
					/>
				</Typography>
			</Box>
		</Box>
	);
}

export default LeadershipChart;
