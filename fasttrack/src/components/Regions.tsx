import React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { RegionsDatum } from "../utils/processdataregions";
import type { List } from "../utils/makelists";
// import type { DownloadStates } from "./MainContainer";
import NumberAnimator from "./NumberAnimator";
import formatSIFloat from "../utils/formatsi";

type RegionsProps = {
	data: RegionsDatum[];
	lists: List;
	// clickedDownload: DownloadStates;
	// setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
};

const regionsSubText = {
	Asia: "Providing critical assistance in complex emergencies, supporting refugees, IDPs, and host communities.",
	Africa: "Supporting humanitarian response across the countries in the region, addressing conflict, displacement, and food insecurity.",
	"Latin America":
		"Supporting humanitarian operations across additional regions, addressing diverse crises and needs.",
	"Middle East":
		"Providing critical assistance in complex emergencies, supporting refugees, IDPs, and host communities.",
	Europe: "Rapid response to large-scale displacement and conflict, ensuring life-saving assistance reaches those most in need.",
	Global: "Supporting humanitarian response across the countries in the region, addressing conflict, displacement, and food insecurity.",
	Micronesia:
		"Rapid response to large-scale displacement and conflict, ensuring life-saving assistance reaches those most in need.",
	Polynesia:
		"Rapid response to large-scale displacement and conflict, ensuring life-saving assistance reaches those most in need.",
	CERF: "Rapid response to large-scale displacement and conflict, ensuring life-saving assistance reaches those most in need.",
	"Australia and New Zealand":
		"fSupporting humanitarian operations across additional regions, addressing diverse crises and needs.",
	Americas:
		"Supporting humanitarian operations across additional regions, addressing diverse crises and needs.",
};

const regionsIconsClass = {
	Asia: "fa-earth-asia",
	Africa: "fa-earth-africa",
	"Latin America": "fa-earth-americas",
	"Middle East": "fa-earth-europe",
	Europe: "fa-earth-europe",
	Global: "fa-globe",
	Micronesia: "fa-earth-oceania",
	Polynesia: "fa-earth-oceania",
	CERF: "fa-globe",
	"Australia and New Zealand": "fa-earth-oceania",
	Americas: "fa-earth-americas",
};

function Regions({
	data,
	lists,
	// clickedDownload,
	// setClickedDownload,
}: RegionsProps) {
	return (
		<Box>
			<Grid
				container
				spacing={2}
				position={"relative"}
			>
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
						Impact by Region
					</Typography>
				</Grid>
			</Grid>
			<Grid
				container
				spacing={2}
				position={"relative"}
			>
				{data.map((region, index) => {
					const tooltipFundTitle =
						region.funds.size > 1 ? "Funds" : "Fund";
					const tooltipFunds = [...region.funds]
						.map(d => lists.fundNames[d])
						.join(", ");
					const tooltipFundText = `<div style='text-align:center;'><span style='font-weight:bold'>${tooltipFundTitle}: </span>${tooltipFunds}</div>`;

					return (
						<Grid
							size={6}
							key={index}
							className="region-card"
						>
							<h3>
								<i
									className={
										"fas " +
										regionsIconsClass[
											region.region as keyof typeof regionsIconsClass
										]
									}
								></i>
								<span style={{ paddingLeft: "0.5em" }}>
									{region.region}
								</span>
							</h3>
							<p>
								{
									regionsSubText[
										region.region as keyof typeof regionsSubText
									]
								}
							</p>
							<Grid
								container
								spacing={2}
							>
								<Grid
									size={6}
									data-tooltip-id="tooltip"
									data-tooltip-html={
										"$" + region.budget.toLocaleString()
									}
									data-tooltip-place="top"
								>
									<Typography
										style={{
											fontSize: "2.5rem",
											color: "var(--ocha-blue)",
											fontWeight: 900,
											fontFamily: "Montserrat",
										}}
									>
										{"$"}
										<NumberAnimator
											number={parseFloat(
												formatSIFloat(region.budget),
											)}
											type={"decimal"}
										/>
										{isNaN(
											+formatSIFloat(region.budget).slice(
												-1,
											),
										)
											? formatSIFloat(
													region.budget,
												).slice(-1)
											: ""}
									</Typography>
									<Typography
										style={{
											fontSize: "1rem",
											fontWeight: 400,
											fontFamily: "Montserrat",
										}}
									>
										Total Allocated
									</Typography>
								</Grid>
								<Grid
									size={6}
									data-tooltip-id="tooltip"
									data-tooltip-html={tooltipFundText}
									data-tooltip-place="top"
								>
									<Typography
										style={{
											fontSize: "2.5rem",
											color: "var(--ocha-blue)",
											fontWeight: 900,
											fontFamily: "Montserrat",
										}}
									>
										<NumberAnimator
											number={region.funds.size}
											type={"integer"}
										/>
									</Typography>
									<Typography
										style={{
											fontSize: "1rem",
											fontWeight: 400,
											fontFamily: "Montserrat",
										}}
									>
										{region.funds.size > 1
											? "Countries"
											: "Country"}
									</Typography>
								</Grid>
								<Grid
									size={6}
									data-tooltip-id="tooltip"
									data-tooltip-html={
										region.targeted.toLocaleString() +
										" people"
									}
									data-tooltip-place="top"
								>
									<Typography
										style={{
											fontSize: "2.5rem",
											color: "var(--ocha-blue)",
											fontWeight: 900,
											fontFamily: "Montserrat",
										}}
									>
										<NumberAnimator
											number={parseFloat(
												formatSIFloat(region.targeted),
											)}
											type={"decimal"}
										/>
										{isNaN(
											+formatSIFloat(
												region.targeted,
											).slice(-1),
										)
											? formatSIFloat(
													region.targeted,
												).slice(-1)
											: ""}
									</Typography>
									<Typography
										style={{
											fontSize: "1rem",
											fontWeight: 400,
											fontFamily: "Montserrat",
										}}
									>
										People Targeted
									</Typography>
								</Grid>
							</Grid>
						</Grid>
					);
				})}
			</Grid>
		</Box>
	);
}

const MemoisedRegions = React.memo(Regions);

export default MemoisedRegions;
