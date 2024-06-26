import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DownloadIcon from "./DownloadIcon";
import Container from "@mui/material/Container";
import { max } from "d3-array";
import TypeAndSectorRow from "./TypeAndSectorRow";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import colors from "../utils/colors";
import downloadData from "../utils/downloaddata";
import { TypesAndSectorChartProps } from "../types";
import { ByOrganizationObj, BySectorObj, ByTypeObj } from "../schemas";

function TypeAndSectorChart<DownloadType>({
	data,
	list,
	clickedDownload,
	title,
	chartType,
	setClickedDownload,
	dataDownload,
}: TypesAndSectorChartProps<DownloadType>) {
	const maxValue = max(
		data.map(d => Math.max(d.reached, d.targeted))
	) as number;

	const listProperty =
		chartType === "beneficiaryTypes"
			? "beneficiaryTypes"
			: chartType === "sectors"
			? "sectors"
			: "organizationTypes";

	function handleDownloadClick() {
		if (chartType === "beneficiaryTypes") {
			const data = (dataDownload as ByTypeObj[]).map(d => ({
				"Report date": d.ReportApprovedDate,
				Year: d.AllocationYear,
				Fund: list.fundAbbreviatedNames[d.PooledFundId],
				"Beneficiary Type": list.beneficiaryTypes[d.BeneficiaryTypeId],
				Targeted:
					(d.TargetBoys || 0) +
					(d.TargetGirls || 0) +
					(d.TargetMen || 0) +
					(d.TargetWomen || 0),
				Reached:
					(d.ReachedBoys || 0) +
					(d.ReachedGirls || 0) +
					(d.ReachedMen || 0) +
					(d.ReachedWomen || 0),
			}));
			downloadData<(typeof data)[number]>(data, "beneficiary_types");
		} else if (chartType === "sectors") {
			const data = (dataDownload as BySectorObj[]).map(d => ({
				"Report date": d.ReportApprovedDate,
				Year: d.AllocationYear,
				Fund: list.fundAbbreviatedNames[d.PooledFundId],
				Sector: list.sectors[d.ClusterId],
				Targeted:
					(d.TargetedBoys || 0) +
					(d.TargetedGirls || 0) +
					(d.TargetedMen || 0) +
					(d.TargetedWomen || 0),
				Reached:
					(d.ReachedBoys || 0) +
					(d.ReachedGirls || 0) +
					(d.ReachedMen || 0) +
					(d.ReachedWomen || 0),
			}));
			downloadData<(typeof data)[number]>(data, "sectors");
		} else if (chartType === "organization") {
			const data = (dataDownload as ByOrganizationObj[]).map(d => ({
				"Report date": d.ReportApprovedDate,
				Year: d.AllocationYear,
				Fund: list.fundAbbreviatedNames[d.PooledFundId],
				Organization: list.organizationTypes[d.OrganizationType],
				Targeted:
					(d.TargetedBoys || 0) +
					(d.TargetedGirls || 0) +
					(d.TargetedMen || 0) +
					(d.TargetedWomen || 0),
				Reached:
					(d.ReachedBoys || 0) +
					(d.ReachedGirls || 0) +
					(d.ReachedMen || 0) +
					(d.ReachedWomen || 0),
			}));
			downloadData<(typeof data)[number]>(data, "organization_types");
		}
	}

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
				type={chartType}
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
					{title}
				</Typography>
				<Typography
					style={{
						fontSize: "0.8rem",
					}}
				>
					{"("}
					<AdsClickIcon
						style={{
							fontSize: 18,
							marginLeft: 3,
							color: "#777",
							opacity: 0.6,
							marginBottom: "-3px",
						}}
					/>
					{
						<span style={{ color: colors.contrastColorDarker }}>
							{" "}
							targeted,{" "}
						</span>
					}
					<DoneIcon
						style={{
							fontSize: 18,
							marginLeft: 3,
							color: "#777",
							opacity: 0.6,
							marginBottom: "-3px",
						}}
					/>
					{<span style={{ color: colors.unColor }}> reached)</span>}
				</Typography>
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
				{data.map(d => (
					<TypeAndSectorRow
						key={d.type}
						type={d.type}
						targeted={d.targeted}
						reached={d.reached}
						maxValue={maxValue}
						list={list[listProperty]}
						chartType={chartType}
					/>
				))}
			</Box>
		</Container>
	);
}

const MemoizedTypeAndSectorChart = React.memo(
	TypeAndSectorChart
) as typeof TypeAndSectorChart;

export default MemoizedTypeAndSectorChart;
