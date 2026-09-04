import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import type { Tranche } from "./MainContainer";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { constants } from "../utils/constants";

type TopSelectorsProps = {
	tranche: Tranche;
	year: number;
	setTranche: React.Dispatch<React.SetStateAction<Tranche>>;
	setYear: React.Dispatch<React.SetStateAction<number>>;
	yearsAsArray: number[];
};

const { tranches } = constants;

const buttonsStyle = {
	"& .MuiToggleButton-root": {
		paddingRight: "1.5em",
		paddingLeft: "1.5em",
	},
};

function TopSelectors({
	tranche,
	setTranche,
	year,
	setYear,
	yearsAsArray,
}: TopSelectorsProps) {
	function handleChangeTranche(
		_event: React.MouseEvent<HTMLElement>,
		newTranche: Tranche,
	) {
		if (newTranche !== null) {
			setTranche(newTranche);
		}
	}

	function handleChangeYear(
		_event: React.MouseEvent<HTMLElement>,
		newYear: number,
	) {
		if (newYear !== null) {
			setYear(newYear);
		}
	}

	return (
		<Box
			sx={{
				display: "flex",
				width: "100%",
				gap: 5,
				alignItems: "center",
				flexDirection: "row",
			}}
		>
			<ToggleButtonGroup
				value={year}
				exclusive
				sx={buttonsStyle}
				onChange={handleChangeYear}
			>
				{yearsAsArray.map(year => (
					<ToggleButton
						value={year}
						key={year}
					>
						{year}
					</ToggleButton>
				))}
			</ToggleButtonGroup>
			<Divider
				orientation="vertical"
				flexItem
				sx={{
					"& .MuiDivider-wrapper": {
						paddingTop: "0em",
						paddingBottom: "0em",
					},
				}}
			></Divider>
			<ToggleButtonGroup
				value={tranche}
				exclusive
				sx={buttonsStyle}
				onChange={handleChangeTranche}
			>
				{tranches.map(tranche => (
					<ToggleButton
						value={tranche}
						key={tranche}
					>
						{tranche === "all"
							? "All Tranches"
							: `Tranche ${tranche}`}
					</ToggleButton>
				))}
			</ToggleButtonGroup>
		</Box>
	);
}

export default TopSelectors;
