import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import Switch from "@mui/material/Switch";
import { CvaChartModes } from "./CvaChart";
import { styled } from "@mui/material/styles";
import colors from "../utils/colors";

type CvaChartSwitchProps = {
	cvaChartMode: CvaChartModes;
	handleSwitchChange: () => void;
};

const StyledSwitch = styled(Switch)(({ theme }) => ({
	width: 82,
	height: 42,
	padding: 10,
	"& .MuiSwitch-switchBase": {
		marginTop: 2,
		padding: 0,
		transform: "translateX(6px)",
		"&.Mui-checked": {
			color: "#fff",
			transform: "translateX(38px)",
			"& .MuiSwitch-thumb:before": {
				backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="30" width="30" viewBox="0 0 15 29"><path fill="${encodeURIComponent(
					"#fff"
				)}" d="M 6.995 18.083 L 6.995 26.833 C 6.995 27.478 6.473 28 5.828 28 C 5.184 28 4.662 27.478 4.662 26.833 L 4.662 8.75 C 3.193 9.578 2.298 11.147 2.333 12.833 C 2.333 13.478 1.811 14 1.167 14 C 0.522 14 0 13.478 0 12.833 C 0 8.959 2.908 6.099 6.995 5.85 L 7 18.083 L 6.995 18.083 L 6.995 18.083 Z  M 8.167 20.417 L 8.167 26.833 C 8.167 27.478 8.689 28 9.333 28 C 9.978 28 10.5 27.478 10.5 26.833 L 10.5 20.417 L 11.667 20.417 C 11.825 20.431 11.982 20.374 12.095 20.262 C 12.208 20.149 12.265 19.992 12.25 19.833 L 9.917 8.75 C 11.647 9.367 12.811 10.996 12.833 12.833 C 12.833 13.478 13.356 14 14 14 C 14.644 14 15.167 13.478 15.167 12.833 C 15.167 8.961 12.255 6.099 8.167 5.85 L 8.167 5.833 L 8.167 20.417 Z"/><path fill="${encodeURIComponent(
					"#fff"
				)}" d="M 5.245 2.333 C 5.245 1.046 6.29 0 7.578 0 C 8.866 0 9.912 1.046 9.912 2.333 C 9.912 3.621 8.866 4.667 7.578 4.667 C 6.29 4.667 5.245 3.621 5.245 2.333 Z"/></svg>')`,
			},
			"& + .MuiSwitch-track": {
				opacity: 1,
				backgroundColor: "#bac4ce",
				...theme.applyStyles("dark", {
					backgroundColor: "#8796A5",
				}),
			},
		},
	},
	"& .MuiSwitch-thumb": {
		backgroundColor: colors.unColor,
		width: 38,
		height: 38,
		"&::before": {
			content: "''",
			position: "absolute",
			width: "100%",
			height: "100%",
			left: 0,
			top: 0,
			backgroundRepeat: "no-repeat",
			backgroundPosition: "center",
			backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="30" width="30" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
				"#fff"
			)}" d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4"/></svg>')`,
		},
		...theme.applyStyles("dark", {
			backgroundColor: "#003892",
		}),
	},
	"& .MuiSwitch-track": {
		opacity: 1,
		backgroundColor: "#bac4ce",
		borderRadius: 20 / 2,
		...theme.applyStyles("dark", {
			backgroundColor: "#8796A5",
		}),
	},
}));

function CvaChartSwitch({
	cvaChartMode,
	handleSwitchChange,
}: CvaChartSwitchProps) {
	return (
		<Grid
			size={2.2}
			style={{
				height: "100%",
				minHeight: "inherit",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "flex-start",
			}}
		>
			<Box
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Typography variant="body2">Filter by:</Typography>
			</Box>
			<Box
				style={{
					marginTop: "0.5em",
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
					width: "100%",
				}}
			>
				<Box
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "flex-end",
						width: "25%",
					}}
				>
					<Typography variant="body2">$USD</Typography>
				</Box>
				<StyledSwitch
					checked={cvaChartMode === "people"}
					onChange={handleSwitchChange}
					color="primary"
					size="medium"
				/>
				<Box
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "flex-start",
						width: "25%",
					}}
				>
					<Typography variant="body2">People</Typography>
				</Box>
			</Box>
		</Grid>
	);
}

export default CvaChartSwitch;
