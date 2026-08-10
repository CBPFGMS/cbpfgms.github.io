import Box from "@mui/material/Box";
import type { InContributionsDataLists } from "../utils/processcontributionsdata";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { constants } from "../utils/constants";
import { useSticky } from "../hooks/useSticky";
import DropdownFunds from "./DropdownFunds";
import type { List } from "../utils/makelists";
import TextField from "@mui/material/TextField";
import type { Attributions } from "../utils/calculateattributions";
import formatSIFloat from "../utils/formatsi";

const { USCode } = constants;

type TopSelectorsProps = {
	setYear: React.Dispatch<React.SetStateAction<number>>;
	year: number;
	hasUS: boolean;
	setHasUS: React.Dispatch<React.SetStateAction<boolean>>;
	inContributionsDataLists: InContributionsDataLists;
	donor: number;
	setFunds: React.Dispatch<React.SetStateAction<number[]>>;
	lists: List;
	funds: number[];
	attributions: Attributions;
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
	donor,
	setFunds,
	lists,
	funds,
	attributions,
}: TopSelectorsProps) {
	const [stickyRef, isSticky] = useSticky<HTMLDivElement>();

	const years = Array.from(
		inContributionsDataLists.yearsPerDonor[donor],
	).sort((a, b) => a - b);

	function handleChangeYear(
		_event: React.MouseEvent<HTMLElement, MouseEvent>,
		value: typeof year,
	) {
		setYear(value);
		setFunds(
			Array.from(
				inContributionsDataLists.fundsPerDonorAndYear[donor][value],
			),
		);
	}

	function handleChangeHasUS(
		_event: React.MouseEvent<HTMLElement, MouseEvent>,
		value: typeof hasUS,
	) {
		if (value !== null) {
			setHasUS(value);
		}
	}

	return (
		<Box
			ref={stickyRef}
			sx={{
				display: "flex",
				flexDirection: "row",
				justifyContent: "space-between",
				alignItems: "center",
				width: "100%",
				position: "sticky",
				top: -1,
				backgroundColor: "rgba(255,255,255,0.95)",
				zIndex: 1200,
				borderBottom: isSticky ? "1px solid #ccc" : "none",
				boxShadow: isSticky
					? "0px 10px 10px -10px rgba(0,0,0,0.2)"
					: "none",
				paddingBottom: 2,
				paddingTop: 2,
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
				<DropdownFunds
					funds={funds}
					setValue={setFunds}
					allFunds={Array.from(
						inContributionsDataLists.fundsPerDonorAndYear[donor][
							year
						],
					)}
					namesList={lists.fundNames}
				/>
			)}
			{isSticky && (
				<TextField
					label="Global attribution"
					value={`${Math.round(attributions.global.percentage * 1000) / 10}% ($${formatSIFloat(attributions.global.donor)})`}
					variant="outlined"
					focused
					slotProps={{
						input: {
							readOnly: true,
						},
					}}
					sx={{
						pointerEvents: "none",
						"& .MuiInputBase-input": {
							padding: "8.5px 14px",
						},
					}}
				/>
			)}
			{donor !== USCode && (
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
		</Box>
	);
}

export default TopSelectors;
