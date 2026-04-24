import { useState } from "react";
import Box from "@mui/material/Box";
import type { List } from "../utils/makelists";
import type { SelectionLevel } from "./MainContainer";
import StepHeader from "./StepHeader";
import Paper from "@mui/material/Paper";
import colors from "../utils/colors";
import { alpha } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import Fade from "@mui/material/Fade";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Button from "@mui/material/Button";

type ActivitySelectProps = {
	activities: number[];
	setActivities: React.Dispatch<React.SetStateAction<number[]>>;
	sectors: number[];
	selectionLevel: SelectionLevel;
	lists: List;
	activitiesComplete: boolean;
	sectorsComplete: boolean;
};

function ActivitySelect({
	activities,
	setActivities,
	sectors,
	selectionLevel,
	lists,
	activitiesComplete,
	sectorsComplete,
}: ActivitySelectProps) {
	const [activityInput, setActivityInput] = useState<string>("");

	const activitiesPerSectorsSelected = Array.from(
		sectors.reduce((acc, sector) => {
			const activities = lists.activitiesPerSector[sector];
			if (activities) {
				activities.forEach(activity => acc.add(activity));
			}
			return acc;
		}, new Set<number>()),
	);

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
						selectionLevel === "sector"
							? alpha(colors.activeGradientStart, 0.4)
							: activitiesComplete
								? alpha(colors.doneGradientStart, 0.2)
								: alpha(colors.inactiveBackground, 0.1),
					p: { xs: 2.5, md: 3 },
					transition: "all 0.3s ease",
					opacity: sectorsComplete ? 1 : 0.55,
					pointerEvents: sectorsComplete ? "auto" : "none",
					boxShadow:
						selectionLevel === "sector"
							? "0 8px 32px rgba(232,115,42,0.08)"
							: "none",
				}}
			>
				<StepHeader
					number="2"
					title="Select Activities"
					subtitle="Search or select (using the dropdown menu) one or more humanitarian activities"
					active={selectionLevel === "sector"}
					done={activitiesComplete}
					doneTitle={"Select activities"}
				/>
				{!sectorsComplete && (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 2,
							py: 2,
							px: 2,
							mt: 4,
							borderRadius: 2,
							background: alpha("#4a5f78", 0.05),
						}}
					>
						<RadioButtonUncheckedIcon
							sx={{
								fontSize: 16,
								color: "text.disabled",
							}}
						/>
						<Typography
							variant="body2"
							sx={{ fontStyle: "italic" }}
						>
							Complete Step 1 (Sector selection) first to unlock
							activity selection.
						</Typography>
					</Box>
				)}
				{sectorsComplete && (
					<Box sx={{ mt: 4 }}>
						<Autocomplete
							multiple
							disableClearable
							options={activitiesPerSectorsSelected}
							getOptionLabel={o => lists.activities[o]}
							value={activities}
							onChange={(_, val) => setActivities(val)}
							inputValue={activityInput}
							onInputChange={(_, val) => setActivityInput(val)}
							filterOptions={(opts, { inputValue }) =>
								opts
									.filter(o =>
										lists.activities[o]
											.toLowerCase()
											.includes(inputValue.toLowerCase()),
									)
									.slice(0, 12)
							}
							renderInput={params => (
								<TextField
									{...params}
									placeholder="Search activities by keyword, code, or description…"
									variant="outlined"
									size="small"
									InputProps={{
										...params.InputProps,
										startAdornment: (
											<>
												<SearchIcon
													sx={{
														mr: 0.5,
														color: "text.secondary",
														fontSize: 20,
													}}
												/>
												{/* Ensure startAdornment exists before rendering */}
												{params.InputProps
													?.startAdornment || null}
											</>
										),
									}}
									sx={{
										"& .MuiOutlinedInput-root": {
											borderRadius: 2.5,
											background: alpha(
												colors.doneGradientStart,
												0.03,
											),
											"&:hover fieldset": {
												borderColor: "primary.main",
											},
										},
									}}
								/>
							)}
							renderTags={() => null}
							renderOption={(props, option, { selected }) => {
								const { key, ...otherProps } = props;

								return (
									<Box
										component="li"
										key={key}
										{...otherProps}
										sx={{
											"&.MuiAutocomplete-option": {
												px: 2,
												py: 1.25,
												borderBottom: "1px solid",
												borderColor: alpha(
													"#4a5f78",
													0.07,
												),
												alignItems: "flex-start",
											},
											"&.MuiAutocomplete-option.Mui-focused":
												{
													background: alpha(
														"#1a5c96",
														0.05,
													),
												},
											"&.MuiAutocomplete-option[aria-selected='true']":
												{
													background: alpha(
														"#1a5c96",
														0.08,
													),
												},
										}}
									>
										<Box
											sx={{
												display: "flex",
												alignItems: "flex-start",
												gap: 1.5,
												width: "100%",
											}}
										>
											<CheckCircleIcon
												sx={{
													fontSize: 16,
													mt: 0.3,
													flexShrink: 0,
													color: selected
														? colors.activeGradientStart
														: alpha(
																"#4a5f78",
																0.25,
															),
													transition:
														"color 0.15s ease",
												}}
											/>
											<Typography
												variant="body2"
												sx={{
													lineHeight: 1.45,
													fontSize: "0.8rem",
												}}
											>
												{lists.activities[option]}
											</Typography>
										</Box>
									</Box>
								);
							}}
							ListboxProps={{ style: { maxHeight: 300 } }}
							noOptionsText="No matching activities found"
							sx={{
								mb: activities.length > 0 ? 2 : 0,
							}}
						/>

						{activities.length > 0 && (
							<Fade in>
								<Box>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											mb: 1,
										}}
									>
										<Typography
											variant="caption"
											color="text.secondary"
										>
											{activities.length} activit
											{activities.length === 1
												? "y"
												: "ies"}{" "}
											selected
										</Typography>
										<Button
											size="small"
											onClick={() => setActivities([])}
											sx={{
												fontSize: "0.7rem",
												color: "text.secondary",
												minWidth: 0,
												py: 0,
											}}
										>
											Clear all
										</Button>
									</Box>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											gap: 0.75,
										}}
									>
										{activities.map(a => (
											<Box
												key={a}
												sx={{
													display: "flex",
													alignItems: "flex-start",
													gap: 1,
													py: 0.75,
													px: 1.5,
													borderRadius: 2,
													background: alpha(
														"#1a5c96",
														0.05,
													),
													border: "1px solid",
													borderColor: alpha(
														"#1a5c96",
														0.12,
													),
												}}
											>
												<CheckCircleIcon
													sx={{
														fontSize: 15,
														mt: 0.35,
														color: colors.activeGradientStart,
														flexShrink: 0,
													}}
												/>
												<Typography
													variant="caption"
													sx={{
														paddingLeft: 1,
														paddingRight: 1,
														textAlign: "left",
														lineHeight: 1.5,
														color: "text.primary",
														flex: 1,
													}}
												>
													{lists.activities[a]}
												</Typography>
												<Box
													component="span"
													onClick={() =>
														setActivities(prev =>
															prev.filter(
																x => x !== a,
															),
														)
													}
													sx={{
														cursor: "pointer",
														color: "text.disabled",
														fontSize: 16,
														lineHeight: 1,
														"&:hover": {
															color: "error.main",
														},
														flexShrink: 0,
														mt: 0.1,
													}}
												>
													×
												</Box>
											</Box>
										))}
									</Box>
								</Box>
							</Fade>
						)}
					</Box>
				)}
			</Paper>
		</Box>
	);
}

export default ActivitySelect;
