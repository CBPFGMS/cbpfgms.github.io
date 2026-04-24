import type { SelectionLevel } from "./MainContainer";
import type { InDataLists } from "../utils/processrawdata";
import type { List } from "../utils/makelists";
import Paper from "@mui/material/Paper";
import StepHeader from "./StepHeader";
import { alpha } from "@mui/material/styles";
import colors from "../utils/colors";
import Box from "@mui/material/Box";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { clustersIconsData } from "../assets/clustericons";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Badge from "@mui/material/Badge";

type SectorSelectProps = {
	sectors: number[];
	setSectors: React.Dispatch<React.SetStateAction<number[]>>;
	selectionLevel: SelectionLevel;
	inDataLists: InDataLists;
	lists: List;
	sectorsComplete: boolean;
};

type SectorCardProps = {
	sector: number;
	selected: boolean;
	onClick: () => void;
	lists: List;
};

function SectorSelect({
	sectors,
	setSectors,
	selectionLevel,
	inDataLists,
	lists,
	sectorsComplete,
}: SectorSelectProps) {
	const sectorsArray = Array.from(inDataLists.sectors).sort((a, b) => a - b);

	const activitiesPerSectorsSelected = sectors.reduce((acc, sector) => {
		const activities = lists.activitiesPerSector[sector];
		if (activities) {
			activities.forEach(activity => acc.add(activity));
		}
		return acc;
	}, new Set<number>());

	function toggleSector(sector: number) {
		setSectors(prev =>
			prev.find(s => s === sector)
				? prev.filter(s => s !== sector)
				: [...prev, sector],
		);
	}

	return (
		<Box
			sx={{
				display: "flex",
				width: "100%",
				justifyContent: "center",
			}}
		>
			<Paper
				elevation={0}
				sx={{
					width: "80%",
					borderRadius: 4,
					border: "1.5px solid",
					borderColor:
						selectionLevel === "nothing"
							? alpha(colors.activeGradientStart, 0.4)
							: sectorsComplete
								? alpha(colors.doneGradientStart, 0.2)
								: alpha(colors.inactiveBackground, 0.1),
					p: { xs: 2.5, md: 3 },
					transition: "all 0.3s ease",
					boxShadow:
						selectionLevel === "nothing"
							? "0 8px 32px rgba(232,115,42,0.08)"
							: "none",
				}}
			>
				<StepHeader
					number="1"
					title="Select the Sector"
					subtitle="Choose one or more sectors to explore their activities"
					active={selectionLevel === "nothing"}
					done={sectorsComplete}
					doneTitle={`${sectors.length} sector${sectors.length > 1 ? "s" : ""} selected`}
					doneSubtitle={` (encompassing ${activitiesPerSectorsSelected.size} activit${activitiesPerSectorsSelected.size === 1 ? "y" : "ies"})`}
				/>
				<Grid
					container
					spacing={2}
					sx={{
						display: "flex",
						flexDirection: "row",
						mt: 4,
						flexWrap: "wrap",
						width: "100%",
					}}
				>
					{sectorsArray.map((sector, index) => (
						<SectorCard
							key={index}
							sector={sector}
							selected={sectors.includes(sector)}
							onClick={() => toggleSector(sector)}
							lists={lists}
						/>
					))}
				</Grid>
			</Paper>
		</Box>
	);
}

function SectorCard({ sector, selected, onClick, lists }: SectorCardProps) {
	return (
		<Grid size={3}>
			<Badge
				badgeContent={lists.activitiesPerSector[sector]?.size}
				sx={{
					width: "100%",
					display: "block",
					"& .MuiBadge-badge": {
						color: "white",
						backgroundColor: "#777", // Your custom hex code
					},
				}}
			>
				<Box
					onClick={onClick}
					sx={{
						cursor: "pointer",
						borderRadius: 2,
						border: "2px solid",
						borderColor: selected ? colors.unColor : "transparent",
						background: selected
							? alpha(colors.unColorLighter, 0.08)
							: alpha("#1a2433", 0.04),
						p: 1.5,
						display: "flex",
						alignItems: "center",
						gap: 1.5,
						transition: "all 0.2s ease",
						userSelect: "none",
						"&:hover": {
							borderColor: selected
								? colors.unColor
								: alpha(colors.unColorLighter, 0.5),
							background: alpha(colors.unColorLighter, 0.06),
							transform: "translateY(-1px)",
							boxShadow: `0 4px 16px ${alpha(colors.unColorLighter, 0.15)}`,
						},
					}}
					data-tooltip-id="tooltip"
					data-tooltip-html={
						selected
							? "Click to deselect"
							: `<div style="max-width: 200px;"><strong>${lists.sectors[sector]}</strong> encompasses ${lists.activitiesPerSector[sector]?.size} activit${lists.activitiesPerSector[sector]?.size === 1 ? "y" : "ies"}</div>`
					}
					data-tooltip-place="top"
				>
					<Box
						sx={{
							width: 32,
							height: 32,
							borderRadius: 2,
							background: selected
								? colors.unColor
								: alpha(colors.unColorLighter, 0.15),
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 20,
							transition: "all 0.2s ease",
							flexShrink: 0,
						}}
					>
						<img
							src={clustersIconsData[sector]}
							width={"50%"}
							height={"50%"}
							style={{
								filter: selected
									? "brightness(0) invert(1)"
									: "none",
							}}
						/>
					</Box>
					<Box
						sx={{
							display: "flex",
							flexGrow: 1,
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Typography
							variant="body2"
							sx={{
								fontWeight: selected ? 600 : 500,
								fontSize: "0.85rem",
								lineHeight: 1.2,
								transition: "all 0.2s ease",
							}}
						>
							{lists.sectors[sector]}
						</Typography>
					</Box>
					<Box
						sx={{
							width: 26,
						}}
					>
						{selected && (
							<CheckCircleIcon
								sx={{
									ml: "auto",
									fontSize: 18,
									color: colors.activeGradientStart,
									flexShrink: 0,
								}}
							/>
						)}
					</Box>
				</Box>
			</Badge>
		</Grid>
	);
}

export default SectorSelect;
