import Box from "@mui/material/Box";
import type { InContributionsDataLists } from "../utils/processcontributionsdata";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { constants } from "../utils/constants";
import { useSticky } from "../hooks/useSticky";
import DropdownDonors from "./DropdownDonors";
import type { List } from "../utils/makelists";
import type { Attributions } from "../utils/calculateattributions";
import formatSIFloat from "../utils/formatsi";
import Chip from "@mui/material/Chip";
import LanguageIcon from "@mui/icons-material/Language";
import colors from "../utils/colors";
import truncatePercentage from "../utils/truncatepercentage";
import toLocaleFixed from "../utils/localefixed";
import FundChip from "./FundChip";

const { firstNSFTYear, USCode } = constants;

type TopSelectorsProps = {
	setYear: React.Dispatch<React.SetStateAction<number>>;
	year: number;
	hasUS: boolean;
	setHasUS: React.Dispatch<React.SetStateAction<boolean>>;
	inContributionsDataLists: InContributionsDataLists;
	fund: number;
	setDonors: React.Dispatch<React.SetStateAction<number[]>>;
	lists: List;
	donors: number[];
	attributions: Attributions;
	dataHasNSFT: boolean;
};

const buttonsStyle = {
	"& .MuiToggleButton-root": {
		color: "rgba(0, 0, 0, 0.87)",
		backgroundColor: "transparent",
		paddingRight: "1.5em",
		paddingLeft: "1.5em",
		fontFamily: "Roboto",
		fontSize: "0.875rem",
		textTransform: "capitalize",
		"&:hover": {
			backgroundColor: "rgba(0, 0, 0, 0.04)",
		},
		"&.Mui-selected": {
			backgroundColor: "rgba(0, 0, 0, 0.08)",
			"&:hover": {
				backgroundColor: "rgba(0, 0, 0, 0.12)",
			},
		},
	},
};

function TopSelectors({
	setYear,
	year,
	hasUS,
	setHasUS,
	inContributionsDataLists,
	fund,
	setDonors,
	lists,
	donors,
	attributions,
	dataHasNSFT,
}: TopSelectorsProps) {
	const [stickyRef, isSticky] = useSticky<HTMLDivElement>();

	const {
		truncatedPercentage,
		truncatedPercentageForDisplay,
		lessThanMinimum,
	} = truncatePercentage(attributions.global.percentage);

	const years = Array.from(inContributionsDataLists.years).sort(
		(a, b) => a - b,
	);

	function handleChangeYear(
		_event: React.MouseEvent<HTMLElement, MouseEvent>,
		value: typeof year,
	) {
		if (value !== null) {
			const nextHasUS = value < firstNSFTYear;

			setYear(value);
			setHasUS(nextHasUS);
			setDonors(getDonorsForSelection(value, nextHasUS));
		}
	}

	function handleChangeHasUS(
		_event: React.MouseEvent<HTMLElement, MouseEvent>,
		value: typeof hasUS,
	) {
		if (value !== null) {
			setHasUS(value);
			setDonors(getDonorsForSelection(year, value));
		}
	}

	function getDonorsForSelection(selectedYear: number, includeUS: boolean) {
		return Array.from(
			inContributionsDataLists.donorsPerYear[selectedYear],
		).filter(donor => includeUS || donor !== USCode);
	}

	return (
		<Box
			ref={stickyRef}
			sx={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				position: "sticky",
				top: -1,
				backgroundColor: "rgba(255,255,255,0.95)",
				borderLeft: "5px solid rgba(255,255,255,0.95)",
				borderRight: "5px solid rgba(255,255,255,0.95)",
				marginLeft: "-5px",
				marginRight: "-5px",
				zIndex: 1200,
				paddingBottom: 4,
				paddingTop: 3,
				boxShadow: isSticky
					? "0px 18px 18px -18px rgba(0,0,0,0.2)"
					: "none",
			}}
		>
			<Box
				sx={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					width: "100%",
				}}
			>
				<ToggleButtonGroup
					value={year}
					exclusive
					sx={buttonsStyle}
					onChange={handleChangeYear}
				>
					{years.map(year => (
						<ToggleButton
							value={year}
							key={year}
						>
							{year}
						</ToggleButton>
					))}
				</ToggleButtonGroup>
				{isSticky && (
					<DropdownDonors
						donors={donors}
						setValue={setDonors}
						allDonors={getDonorsForSelection(year, hasUS)}
						namesList={lists.donorGMSNames}
					/>
				)}
				{year >= firstNSFTYear && dataHasNSFT && (
					<ToggleButtonGroup
						value={hasUS}
						exclusive
						sx={buttonsStyle}
						onChange={handleChangeHasUS}
					>
						<ToggleButton value={false}>Without U.S.</ToggleButton>
						<ToggleButton value={true}>With U.S.</ToggleButton>
					</ToggleButtonGroup>
				)}
				{isSticky && (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: "0.4em",
						}}
					>
						<Chip
							data-tooltip-id="tooltip"
							data-tooltip-content={`${lists.fundNames[fund]} combined attribution for the selected donors is $${toLocaleFixed(attributions.global.fund, 0, 2)}, which corresponds to ${lessThanMinimum || truncatedPercentage}% of the total $${toLocaleFixed(attributions.global.total, 0, 2)} donated from those donors.`}
							data-tooltip-place="bottom"
							icon={
								<LanguageIcon
									sx={{ color: "#fff !important" }}
								/>
							}
							label={`${truncatedPercentageForDisplay}% ($${formatSIFloat(attributions.global.fund)})`}
							size="medium"
							sx={{
								color: "#fff",
								backgroundColor: colors.fundColor,
								fontWeight: 600,
								fontSize: "1rem",
								height: 36,
							}}
						/>
					</Box>
				)}
			</Box>
			<FundChip isSticky={isSticky} />
		</Box>
	);
}

export default TopSelectors;
