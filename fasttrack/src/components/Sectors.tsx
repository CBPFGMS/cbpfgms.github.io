import React, { useRef } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { List } from "../utils/makelists";
import type { DownloadStates } from "./MainContainer";
import type { SectorsData } from "../utils/processdatasectors";
import { clustersIconsData } from "../assets/clustericons";
import type { SectorsDatumDownload } from "../utils/processdownload";
import DownloadAndImageContainer from "./DownloadAndImageContainer";
import downloadData from "../utils/downloaddata";

type SectorsProps = {
	data: SectorsData;
	lists: List;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	dataSectorsDownload: () => SectorsDatumDownload[];
};

const sectorsText: { [key: number]: string } = {
	1: "Ensuring protection and proper coordination of services to IDPs",
	2: "Supporting the transition from humanitarian relief to long-term recovery",
	3: "Emergency education and learning opportunities",
	4: "Emergency shelter and non-food items for displaced populations",
	5: "Essential communication services to aid workers and the affected community",
	6: "Emergency food assistance and agricultural support",
	7: "Medical services, nutrition programs, and disease prevention",
	8: "Transportation and storage of humanitarian aid",
	9: "Therapeutic feeding for severely malnourished individuals and nutritional support",
	10: "Child protection, GBV prevention, and human rights support",
	11: "Water, sanitation, and hygiene programs",
	12: "Management and coordination of the humanitarian response",
	13: "Aid covers multiple sectors simultaneously",
	14: "COVID-19",
	15: "Cash assistance to affected people, increasing dignity and efficiency.",
	17: "Common Services",
	18: "Multi-Sector Refugee Assistance",
};

function Sectors({
	data,
	lists,
	clickedDownload,
	setClickedDownload,
	dataSectorsDownload,
}: SectorsProps) {
	const ref = useRef<HTMLDivElement>(null);

	function handleDownloadClick() {
		const dataSectors = dataSectorsDownload();
		downloadData<(typeof dataSectors)[number]>(dataSectors, "sectors");
	}

	return (
		<Box ref={ref}>
			<Grid
				container
				spacing={2}
				position={"relative"}
			>
				<DownloadAndImageContainer
					handleDownloadClick={handleDownloadClick}
					clickedDownload={clickedDownload}
					setClickedDownload={setClickedDownload}
					type="sectors"
					refElement={ref}
					fileName="Sectors"
				/>
				<Grid
					size={12}
					mb={3}
				>
					<Typography
						style={{
							color: "var(--ocha-blue)",
							fontWeight: 700,
							margin: "30px 0 22px 0",
							textAlign: "center",
							fontSize: "2rem",
							fontFamily: "Montserrat",
						}}
					>
						Funding by Sector
					</Typography>
				</Grid>
			</Grid>
			<Grid
				container
				spacing={2}
				position={"relative"}
				display={"flex"}
				justifyContent={"center"}
			>
				{data.sectors.map((sectorDatum, index) => {
					const tooltipSectorsText = `Sector budget: $${sectorDatum.budget.toLocaleString()}<br />(${(sectorDatum.percentage * 100).toFixed(2)}% of the total: $${data.total.toLocaleString()})`;
					return (
						<Grid
							size={8}
							key={index}
							style={{
								display: "flex",
								alignItems: "center",
								padding: "20px",
								background: "#f8f9fa",
								borderRadius: "8px",
								marginBottom: "15px",
								flexDirection: "row",
								justifyContent: "space-between",
							}}
							data-tooltip-id="tooltip"
							data-tooltip-html={tooltipSectorsText}
							data-tooltip-place="top"
						>
							<Box
								style={{
									width: "60px",
									height: "60px",
									background: "#146eb4",
									borderRadius: "50%",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "white",
									fontSize: "1.5rem",
									marginRight: "20px",
									flexShrink: "0",
								}}
							>
								<img
									src={clustersIconsData[sectorDatum.sector]}
									width={"50%"}
									height={"50%"}
									style={{
										padding: "4px",
										filter: "brightness(0) invert(1)",
									}}
								/>
							</Box>
							<Box
								style={{
									display: "flex",
									alignItems: "flex-start",
									justifyContent: "center",
									flexDirection: "column",
									flexGrow: 1,
									height: "100%",
								}}
							>
								<Typography
									style={{
										color: "var(--ocha-blue)",
										fontWeight: 600,
										fontSize: "1.5rem",
										fontFamily: "Montserrat",
									}}
								>
									{lists.sectors[sectorDatum.sector]}
								</Typography>
								<Typography
									style={{
										color: "#666",
										fontSize: "1rem",
									}}
								>
									{sectorsText[sectorDatum.sector]}
								</Typography>
							</Box>
							<Box
								style={{
									width: "60px",
									height: "60px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									marginLeft: "20px",
								}}
							>
								<Typography
									style={{
										fontSize: "2rem",
										color: "var(--ocha-blue)",
										fontWeight: 900,
										fontFamily: "Montserrat",
									}}
								>
									{!Math.round(
										sectorDatum.percentage * 100,
									) && "<"}
									{Math.round(sectorDatum.percentage * 100) ||
										1}
									{"%"}
								</Typography>
							</Box>
						</Grid>
					);
				})}
			</Grid>
		</Box>
	);
}

const MemoisedSectors = React.memo(Sectors);

export default MemoisedSectors;
