import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DownloadIcon from "./DownloadIcon";
import Container from "@mui/material/Container";
import { max } from "d3";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import DoneIcon from "@mui/icons-material/Done";
import colors from "../utils/colors";
//import downloadData from "../utils/downloaddata";
import { List } from "../utils/makelists";
import constants from "../utils/constants";
import { DownloadStates, Charts } from "./MainContainer";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import BarChartRow from "./BarChartRow";
import capitalizeString from "../utils/capitalizestring";
import Snack from "./Snack";
import { DatumBarChart } from "../utils/processdatabarchart";

type BarChartProps = {
	originalData: DatumBarChart[];
	lists: List;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	title: string;
	chartType: Charts;
};

type Data = {
	type: number;
	targeted: number;
	reached: number;
};

type BeneficiaryCategory = (typeof beneficiaryCategories)[number];

const { beneficiaryCategories } = constants;

function BarChart({
	originalData,
	lists,
	clickedDownload,
	setClickedDownload,
	title,
	chartType,
}: BarChartProps) {
	const [openSnack, setOpenSnack] = useState<boolean>(false);

	const [beneficiaryCategoryArray, setBeneficiaryCategoryArray] = useState<
		BeneficiaryCategory[]
	>([...beneficiaryCategories]);

	const listProperty: keyof List =
		chartType === "beneficiaryTypes"
			? "beneficiaryTypes"
			: chartType === "sectors"
			? "sectors"
			: chartType === "organizations"
			? "organizationTypes"
			: ("" as never);

	const data: Data[] = originalData.map(d => {
		const targeted = Object.entries(d.targeted).reduce(
			(acc, [key, value]) => {
				if (
					beneficiaryCategoryArray.includes(
						key as BeneficiaryCategory
					)
				) {
					acc += value;
				}
				return acc;
			},
			0
		);
		const reached = Object.entries(d.reached).reduce(
			(acc, [key, value]) => {
				if (
					beneficiaryCategoryArray.includes(
						key as BeneficiaryCategory
					)
				) {
					acc += value;
				}
				return acc;
			},
			0
		);
		return { type: d.type, targeted, reached };
	});

	const maxValue = max(
		data.map(d => Math.max(d.reached, d.targeted))
	) as number;

	// function handleDownloadClick() {
	// 	if (chartType === "beneficiaryTypes") {
	// 		const data = (dataDownload as ByTypeObj[]).map(d => ({
	// 			"Report date": d.ReportApprovedDate,
	// 			Year: d.AllocationYear,
	// 			Fund: list.fundAbbreviatedNames[d.PooledFundId],
	// 			"Beneficiary Type": list.beneficiaryTypes[d.BeneficiaryTypeId],
	// 			Targeted:
	// 				(d.TargetBoys || 0) +
	// 				(d.TargetGirls || 0) +
	// 				(d.TargetMen || 0) +
	// 				(d.TargetWomen || 0),
	// 			Reached:
	// 				(d.ReachedBoys || 0) +
	// 				(d.ReachedGirls || 0) +
	// 				(d.ReachedMen || 0) +
	// 				(d.ReachedWomen || 0),
	// 		}));
	// 		downloadData<(typeof data)[number]>(data, "beneficiary_types");
	// 	} else if (chartType === "sectors") {
	// 		const data = (dataDownload as BySectorObj[]).map(d => ({
	// 			"Report date": d.ReportApprovedDate,
	// 			Year: d.AllocationYear,
	// 			Fund: list.fundAbbreviatedNames[d.PooledFundId],
	// 			Sector: list.sectors[d.ClusterId],
	// 			Targeted:
	// 				(d.TargetedBoys || 0) +
	// 				(d.TargetedGirls || 0) +
	// 				(d.TargetedMen || 0) +
	// 				(d.TargetedWomen || 0),
	// 			Reached:
	// 				(d.ReachedBoys || 0) +
	// 				(d.ReachedGirls || 0) +
	// 				(d.ReachedMen || 0) +
	// 				(d.ReachedWomen || 0),
	// 		}));
	// 		downloadData<(typeof data)[number]>(data, "sectors");
	// 	} else if (chartType === "organization") {
	// 		const data = (dataDownload as ByOrganizationObj[]).map(d => ({
	// 			"Report date": d.ReportApprovedDate,
	// 			Year: d.AllocationYear,
	// 			Fund: list.fundAbbreviatedNames[d.PooledFundId],
	// 			Organization: list.organizationTypes[d.OrganizationType],
	// 			Targeted:
	// 				(d.TargetedBoys || 0) +
	// 				(d.TargetedGirls || 0) +
	// 				(d.TargetedMen || 0) +
	// 				(d.TargetedWomen || 0),
	// 			Reached:
	// 				(d.ReachedBoys || 0) +
	// 				(d.ReachedGirls || 0) +
	// 				(d.ReachedMen || 0) +
	// 				(d.ReachedWomen || 0),
	// 		}));
	// 		downloadData<(typeof data)[number]>(data, "organization_types");
	// 	}
	// }

	function handleOnChange(category: BeneficiaryCategory) {
		if (beneficiaryCategoryArray.includes(category)) {
			if (beneficiaryCategoryArray.length === 1) {
				setOpenSnack(true);
				return;
			}
			setBeneficiaryCategoryArray(
				beneficiaryCategoryArray.filter(e => e !== category)
			);
		} else {
			setBeneficiaryCategoryArray([
				...beneficiaryCategoryArray,
				category,
			]);
		}
	}

	return (
		<Container
			disableGutters={true}
			style={{
				position: "relative",
			}}
		>
			<Snack
				openSnack={openSnack}
				setOpenSnack={setOpenSnack}
				message={`At least one beneficiary must be selected`}
			/>
			<DownloadIcon
				//handleDownloadClick={handleDownloadClick}
				clickedDownload={clickedDownload}
				setClickedDownload={setClickedDownload}
				type="beneficiaryTypes"
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
				flexDirection={"row"}
				mt={2}
				mb={2}
				alignItems={"center"}
				justifyContent={"center"}
			>
				<FormGroup row>
					{beneficiaryCategories.map((category, i) => (
						<FormControlLabel
							key={i}
							control={
								<Checkbox
									checked={beneficiaryCategoryArray.includes(
										category
									)}
									onChange={() => handleOnChange(category)}
									name={category}
									color="primary"
								/>
							}
							label={
								<Typography
									style={{
										fontSize: "0.9em",
										fontWeight: 500,
									}}
									sx={{ marginLeft: -0.5 }}
								>
									{capitalizeString(category)}
								</Typography>
							}
						/>
					))}
				</FormGroup>
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
					<BarChartRow
						key={d.type}
						type={d.type}
						targeted={d.targeted}
						reached={d.reached}
						maxValue={maxValue}
						list={lists[listProperty]}
						chartType={chartType}
					/>
				))}
			</Box>
		</Container>
	);
}

export default BarChart;
