import React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SectorsData } from "../utils/processdatasectors";
import { clustersIconsData } from "../assets/clustericons";
import type { List } from "../utils/makelists";
import formatSIFloat from "../utils/formatsi";

type SectorsRibbonProps = {
	dataSectors: SectorsData;
	sector: number[];
	setSector: React.Dispatch<React.SetStateAction<number[]>>;
	lists: List;
};

function SectorsRibbon({
	dataSectors,
	sector,
	setSector,
	lists,
}: SectorsRibbonProps) {
	function handleClick(d: number) {
		if (sector.includes(d)) {
			setSector(sector.filter(s => s !== d));
		} else {
			setSector([...sector, d]);
		}
	}

	return (
		<Grid
			container
			alignItems={"stretch"}
			justifyContent={"flex-start"}
			gap={1}
			mb={4}
		>
			{dataSectors.sectors.map((datum, index) => {
				const tooltipSectorsText = sector.includes(datum.sector)
					? `Click for removing`
					: `Click for adding`;
				return (
					<Grid
						key={index}
						style={{
							display: "flex",
							alignItems: "flex-start",
							padding: "8px",
							background: "#f8f9fa",
							borderRadius: "4px",
							flexDirection: "column",
							justifyContent: "space-between",
							cursor: "pointer",
							border: "1px solid #146eb4",
							filter: sector.includes(datum.sector)
								? "none"
								: "grayscale(1) opacity(0.75)",
						}}
						data-tooltip-id="tooltip"
						data-tooltip-html={tooltipSectorsText}
						data-tooltip-place="top"
						size={1.9}
						onClick={() => handleClick(datum.sector)}
					>
						<Box>
							<Box
								style={{
									width: "26px",
									height: "26px",
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
								mb={0.5}
							>
								<img
									src={clustersIconsData[datum.sector]}
									width={"50%"}
									height={"50%"}
									style={{
										filter: "brightness(0) invert(1)",
									}}
								/>
							</Box>
							<Typography
								style={{
									color: "var(--ocha-blue)",
									fontWeight: 600,
									fontSize: "0.9rem",
									fontFamily: "Montserrat",
									lineHeight: 1.2,
								}}
								mb={1}
							>
								{lists.sectors[datum.sector]}
							</Typography>
						</Box>
						<Box>
							<Typography
								style={{
									fontSize: "0.8rem",
									color: "#666",
									fontWeight: 900,
									fontFamily: "Montserrat",
								}}
								mb={0.5}
							>
								${formatSIFloat(datum.budget)}
								{" ("}
								{!Math.round(datum.percentage * 100) && "<"}
								{Math.round(datum.percentage * 100) || 1}
								{"%)"}
							</Typography>
							<Box
								style={{
									width: "100%",
									height: "6px",
									background: "#ccc",
								}}
							>
								<Box
									style={{
										width: `${Math.round(
											datum.percentage * 100,
										)}%`,
										height: "100%",
										background: "#146eb4",
									}}
								/>
							</Box>
						</Box>
					</Grid>
				);
			})}
		</Grid>
	);
}

const MemoisedSectorsRibbon = React.memo(SectorsRibbon);

export default MemoisedSectorsRibbon;
