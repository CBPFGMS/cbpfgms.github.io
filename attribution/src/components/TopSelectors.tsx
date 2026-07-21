import Box from "@mui/material/Box";
import type { InContributionsDataLists } from "../utils/processcontributionsdata";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { constants } from "../utils/constants";

const { USCode } = constants;

type TopSelectorsProps = {
	setYear: React.Dispatch<React.SetStateAction<number>>;
	year: number;
	hasUS: boolean;
	setHasUS: React.Dispatch<React.SetStateAction<boolean>>;
	inContributionsDataLists: InContributionsDataLists;
	donor: number;
	setFunds: React.Dispatch<React.SetStateAction<number[]>>;
};

const buttonsStyle = {
	"& .MuiToggleButton-root": {
		color: "rgba(0, 0, 0, 0.87)",
		borderColor: "1px solid rgba(0, 0, 0, 0.12)",
		backgroundColor: "transparent",
		paddingRight: "1.5em",
		paddingLeft: "1.5em",
		fontFamily: "Roboto",
		fontSize: "0.875rem",
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
}: TopSelectorsProps) {
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
			{donor !== USCode && (
				<ToggleButtonGroup
					value={hasUS}
					exclusive
					sx={buttonsStyle}
					onChange={handleChangeHasUS}
				>
					<ToggleButton value={false}>Without US</ToggleButton>
					<ToggleButton value={true}>With US</ToggleButton>
				</ToggleButtonGroup>
			)}
		</Box>
	);
}

export default TopSelectors;
