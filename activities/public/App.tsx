import { useState, useMemo } from "react";
import {
	Box,
	Typography,
	Chip,
	Autocomplete,
	TextField,
	Paper,
	Stepper,
	Step,
	StepLabel,
	StepContent,
	Button,
	Fade,
	Grow,
	Avatar,
	Divider,
	Badge,
	alpha,
	createTheme,
	ThemeProvider,
	CssBaseline,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import MapIcon from "@mui/icons-material/Map";
import SearchIcon from "@mui/icons-material/Search";
import LayersIcon from "@mui/icons-material/Layers";

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
	palette: {
		mode: "light",
		primary: { main: "#1a5c96", light: "#2e7bc4", dark: "#0e3d66" },
		secondary: { main: "#e8732a", light: "#f0914f", dark: "#b5561e" },
		background: { default: "#f0f4f8", paper: "#ffffff" },
		text: { primary: "#1a2433", secondary: "#4a5f78" },
	},
	typography: {
		fontFamily: "'Outfit', sans-serif",
		h1: { fontFamily: "'Fraunces', serif", fontWeight: 700 },
		h2: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
		h3: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
		h4: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
		h5: { fontFamily: "'Fraunces', serif", fontWeight: 500 },
		h6: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
	},
	shape: { borderRadius: 12 },
	components: {
		MuiPaper: {
			styleOverrides: {
				root: { backgroundImage: "none" },
			},
		},
		MuiChip: {
			styleOverrides: {
				root: { fontFamily: "'Outfit', sans-serif", fontWeight: 500 },
			},
		},
	},
});

// ─── Data ─────────────────────────────────────────────────────────────────────
const SECTORS = [
	{ id: 1, label: "Education", icon: "📚", color: "#4361ee" },
	{ id: 2, label: "Protection", icon: "🛡️", color: "#7209b7" },
	{ id: 3, label: "Food Security", icon: "🌾", color: "#2d9e4f" },
	{ id: 4, label: "Health", icon: "🏥", color: "#e63946" },
	{ id: 5, label: "Shelter & NFI", icon: "🏠", color: "#f4a261" },
	{ id: 6, label: "WASH", icon: "💧", color: "#118ab2" },
	{ id: 7, label: "Nutrition", icon: "🥗", color: "#80b918" },
	{ id: 8, label: "Livelihoods", icon: "💼", color: "#e76f51" },
	{ id: 9, label: "Camp Coordination", icon: "⛺", color: "#a8dadc" },
	{ id: 10, label: "Emergency Telecoms", icon: "📡", color: "#457b9d" },
];

const ACTIVITIES = [
	"(Global) (C-CA1) Ensure establishment and improvement of camps or communal settlements and basic infrastructure to facilitate the provision of life-saving assistance",
	"(Global) (E-ED1) Provide formal and non-formal education to school-aged children in emergency settings",
	"(Global) (E-ED2) Distribute learning materials and supplies to support continuity of education",
	"(Global) (E-ED3) Train teachers and education personnel on psychosocial support and safe learning environments",
	"(Global) (FS-FSL1) Distribute unconditional food assistance to acutely food-insecure households",
	"(Global) (FS-FSL2) Support smallholder farmers with seeds, tools, and inputs for rapid crop recovery",
	"(Global) (FS-FSL3) Implement cash and voucher assistance for food purchasing in functional markets",
	"(Global) (H-HLT1) Deploy mobile health teams to provide primary healthcare in hard-to-reach areas",
	"(Global) (H-HLT2) Provide emergency reproductive and maternal health services",
	"(Global) (H-HLT3) Conduct mass vaccination campaigns against preventable diseases",
	"(Global) (H-HLT4) Ensure continuity of treatment for chronic diseases and mental health conditions",
	"(Global) (L-LVH1) Provide emergency employment and cash-for-work opportunities for displaced persons",
	"(Global) (L-LVH2) Deliver vocational training and skills development for market reintegration",
	"(Global) (N-NUT1) Treat severe acute malnutrition through therapeutic feeding programs",
	"(Global) (N-NUT2) Implement community management of acute malnutrition at scale",
	"(Global) (N-NUT3) Distribute micronutrient supplements and fortified food to vulnerable groups",
	"(Global) (P-PRO1) Establish safe spaces and protection monitoring systems for at-risk populations",
	"(Global) (P-PRO2) Provide gender-based violence prevention, mitigation, and response services",
	"(Global) (P-PRO3) Facilitate documentation and legal identity services for displaced persons",
	"(Global) (P-PRO4) Deliver child protection services including case management and psychosocial support",
	"(Global) (P-PRO5) Implement mine risk education and explosive ordnance disposal awareness",
	"(Global) (S-SHE1) Provide emergency shelter kits and non-food items to newly displaced households",
	"(Global) (S-SHE2) Upgrade and rehabilitate transitional shelter for protracted displacement settings",
	"(Global) (S-SHE3) Distribute winterization materials including blankets, heaters, and warm clothing",
	"(Global) (T-TEL1) Deploy emergency telecommunications infrastructure to support humanitarian coordination",
	"(Global) (T-TEL2) Establish internet connectivity hubs for affected communities and responders",
	"(Global) (W-WAS1) Provide safe drinking water through trucking, treatment, and distribution systems",
	"(Global) (W-WAS2) Construct and rehabilitate latrines and sanitation facilities in displacement sites",
	"(Global) (W-WAS3) Promote hygiene behaviors and distribute hygiene kits to at-risk households",
	"(Global) (W-WAS4) Conduct water quality testing and chlorination in communal water points",
	"(Regional) (C-CA2) Develop and implement site management plans for informal settlements in urban areas",
	"(Regional) (E-ED4) Rehabilitate and construct temporary learning spaces in conflict-affected areas",
	"(Regional) (FS-FSL4) Conduct food security assessments and market monitoring to inform response",
	"(Regional) (FS-FSL5) Restore livestock assets and support pastoral communities post-drought",
	"(Regional) (H-HLT5) Strengthen disease surveillance and early warning systems",
	"(Regional) (H-HLT6) Rehabilitate health infrastructure damaged by conflict or natural disaster",
	"(Regional) (L-LVH3) Support micro-enterprise and small business recovery grants for women",
	"(Regional) (N-NUT4) Scale up blanket supplementary feeding programs for children under five",
	"(Regional) (P-PRO6) Monitor and document human rights violations and protection incidents",
	"(Regional) (P-PRO7) Facilitate family tracing and reunification for separated and unaccompanied children",
	"(Regional) (S-SHE4) Support host community housing rehabilitation to prevent further displacement",
	"(Regional) (W-WAS5) Rehabilitate water supply systems including boreholes and piped networks",
	"(Regional) (E-ED5) Provide accelerated education programs for out-of-school youth and adolescents",
	"(Regional) (H-HLT7) Procure and distribute essential medicines and medical supplies",
	"(Regional) (N-NUT5) Train community health workers on infant and young child feeding practices",
	"(Regional) (P-PRO8) Provide legal aid and representation for persons of concern",
	"(Regional) (C-CA3) Coordinate multi-sector needs assessments in newly accessible areas",
	"(Regional) (FS-FSL6) Establish community grain banks and storage facilities for food reserves",
	"(Regional) (W-WAS6) Implement solid waste management systems in high-density displacement sites",
	"(Regional) (L-LVH4) Facilitate access to financial services and mobile money for displaced populations",
];

const activityOptions = ACTIVITIES.map((a, i) => ({ id: i + 1, label: a }));

// ─── Sector Card ──────────────────────────────────────────────────────────────
function SectorCard({ sector, selected, onClick }) {
	return (
		<Box
			onClick={onClick}
			sx={{
				position: "relative",
				cursor: "pointer",
				borderRadius: 3,
				border: "2px solid",
				borderColor: selected ? sector.color : "transparent",
				background: selected
					? alpha(sector.color, 0.08)
					: alpha("#1a2433", 0.04),
				p: 1.5,
				display: "flex",
				alignItems: "center",
				gap: 1.5,
				transition: "all 0.2s ease",
				userSelect: "none",
				"&:hover": {
					borderColor: sector.color,
					background: alpha(sector.color, 0.06),
					transform: "translateY(-1px)",
					boxShadow: `0 4px 16px ${alpha(sector.color, 0.15)}`,
				},
			}}
		>
			<Box
				sx={{
					width: 40,
					height: 40,
					borderRadius: 2,
					background: selected
						? sector.color
						: alpha(sector.color, 0.15),
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: 20,
					transition: "all 0.2s ease",
					flexShrink: 0,
				}}
			>
				{sector.icon}
			</Box>
			<Typography
				variant="body2"
				sx={{
					fontWeight: selected ? 600 : 500,
					color: selected ? sector.color : "text.primary",
					fontSize: "0.85rem",
					lineHeight: 1.2,
					transition: "all 0.2s ease",
				}}
			>
				{sector.label}
			</Typography>
			{selected && (
				<CheckCircleIcon
					sx={{
						ml: "auto",
						fontSize: 18,
						color: sector.color,
						flexShrink: 0,
					}}
				/>
			)}
		</Box>
	);
}

// ─── Step Header ──────────────────────────────────────────────────────────────
function StepHeader({ number, title, subtitle, active, done }) {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "flex-start",
				gap: 2,
				mb: done || active ? 2.5 : 0,
			}}
		>
			<Box
				sx={{
					width: 40,
					height: 40,
					borderRadius: "50%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
					background: done
						? "linear-gradient(135deg, #1a5c96, #2e7bc4)"
						: active
							? "linear-gradient(135deg, #e8732a, #f0914f)"
							: alpha("#4a5f78", 0.1),
					boxShadow:
						done || active ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
					transition: "all 0.3s ease",
				}}
			>
				{done ? (
					<CheckCircleIcon sx={{ color: "#fff", fontSize: 20 }} />
				) : (
					<Typography
						sx={{
							color: active ? "#fff" : "text.secondary",
							fontWeight: 700,
							fontSize: "0.9rem",
						}}
					>
						{number}
					</Typography>
				)}
			</Box>
			<Box>
				<Typography
					variant="h6"
					sx={{
						fontWeight: 700,
						color: done
							? "primary.main"
							: active
								? "secondary.main"
								: "text.secondary",
						fontSize: "1rem",
						transition: "color 0.3s ease",
					}}
				>
					{title}
				</Typography>
				{(active || done) && (
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ lineHeight: 1.3 }}
					>
						{subtitle}
					</Typography>
				)}
			</Box>
		</Box>
	);
}

// ─── Mock Map Placeholder ─────────────────────────────────────────────────────
function MapPlaceholder({ sectors, activities }) {
	const dots = useMemo(() => {
		return Array.from(
			{ length: Math.min(activities.length * 3 + 5, 40) },
			(_, i) => ({
				id: i,
				x: 10 + Math.random() * 80,
				y: 15 + Math.random() * 70,
				size: 6 + Math.random() * 8,
				opacity: 0.5 + Math.random() * 0.5,
			}),
		);
	}, [activities.length]);

	return (
		<Box
			sx={{
				width: "100%",
				height: 380,
				borderRadius: 3,
				background:
					"linear-gradient(160deg, #cfe8f3 0%, #b8d9e8 40%, #a3cad9 100%)",
				position: "relative",
				overflow: "hidden",
				border: "2px solid",
				borderColor: alpha("#1a5c96", 0.2),
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			{/* Grid lines */}
			{[20, 40, 60, 80].map(p => (
				<Box
					key={`h${p}`}
					sx={{
						position: "absolute",
						top: `${p}%`,
						left: 0,
						right: 0,
						height: "1px",
						background: alpha("#1a5c96", 0.08),
					}}
				/>
			))}
			{[20, 40, 60, 80].map(p => (
				<Box
					key={`v${p}`}
					sx={{
						position: "absolute",
						left: `${p}%`,
						top: 0,
						bottom: 0,
						width: "1px",
						background: alpha("#1a5c96", 0.08),
					}}
				/>
			))}

			{/* Continent blobs */}
			<Box
				sx={{
					position: "absolute",
					top: "25%",
					left: "15%",
					width: "30%",
					height: "45%",
					borderRadius: "40% 60% 55% 45%",
					background: alpha("#7ab648", 0.35),
				}}
			/>
			<Box
				sx={{
					position: "absolute",
					top: "20%",
					left: "48%",
					width: "28%",
					height: "40%",
					borderRadius: "55% 45% 40% 60%",
					background: alpha("#7ab648", 0.35),
				}}
			/>
			<Box
				sx={{
					position: "absolute",
					top: "20%",
					left: "78%",
					width: "18%",
					height: "50%",
					borderRadius: "50% 50% 45% 55%",
					background: alpha("#7ab648", 0.3),
				}}
			/>

			{/* Activity dots */}
			{dots.map(dot => (
				<Box
					key={dot.id}
					sx={{
						position: "absolute",
						left: `${dot.x}%`,
						top: `${dot.y}%`,
						width: dot.size,
						height: dot.size,
						borderRadius: "50%",
						background: "#e8732a",
						opacity: dot.opacity,
						border: "2px solid white",
						boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
						animation: `pulse 2s ease-in-out ${
							dot.id * 0.1
						}s infinite alternate`,
						"@keyframes pulse": {
							from: {
								transform: "scale(1)",
								opacity: dot.opacity,
							},
							to: {
								transform: "scale(1.25)",
								opacity: dot.opacity * 0.7,
							},
						},
					}}
				/>
			))}

			{/* Overlay label */}
			<Box
				sx={{
					position: "absolute",
					bottom: 16,
					left: 16,
					background: alpha("#fff", 0.9),
					backdropFilter: "blur(8px)",
					borderRadius: 2,
					px: 2,
					py: 1,
					display: "flex",
					alignItems: "center",
					gap: 1,
					boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
				}}
			>
				<Box
					sx={{
						width: 10,
						height: 10,
						borderRadius: "50%",
						background: "#e8732a",
						border: "2px solid white",
						boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
					}}
				/>
				<Typography
					variant="caption"
					sx={{ fontWeight: 600, color: "text.primary" }}
				>
					{dots.length} activity locations
				</Typography>
			</Box>

			{/* Top-right badge */}
			<Box
				sx={{
					position: "absolute",
					top: 12,
					right: 12,
					background: alpha("#1a5c96", 0.9),
					borderRadius: 2,
					px: 1.5,
					py: 0.5,
					display: "flex",
					alignItems: "center",
					gap: 0.5,
				}}
			>
				<MapIcon sx={{ fontSize: 14, color: "#fff" }} />
				<Typography
					variant="caption"
					sx={{ color: "#fff", fontWeight: 600, fontSize: "0.7rem" }}
				>
					Interactive Map
				</Typography>
			</Box>

			{/* React-Leaflet hint */}
			<Box
				sx={{
					position: "absolute",
					bottom: 16,
					right: 16,
					background: alpha("#fff", 0.75),
					backdropFilter: "blur(6px)",
					borderRadius: 1.5,
					px: 1.5,
					py: 0.5,
				}}
			>
				<Typography
					variant="caption"
					sx={{ color: "text.secondary", fontSize: "0.65rem" }}
				>
					react-leaflet placeholder
				</Typography>
			</Box>
		</Box>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HumanitarianExplorer() {
	const [selectedSectors, setSelectedSectors] = useState([]);
	const [selectedActivities, setSelectedActivities] = useState([]);
	const [activityInput, setActivityInput] = useState("");

	const sectorsComplete = selectedSectors.length > 0;
	const activitiesComplete = selectedActivities.length > 0;
	const showMap = sectorsComplete && activitiesComplete;

	const activeStep = !sectorsComplete ? 0 : !activitiesComplete ? 1 : 2;

	const toggleSector = sector => {
		setSelectedSectors(prev =>
			prev.find(s => s.id === sector.id)
				? prev.filter(s => s.id !== sector.id)
				: [...prev, sector],
		);
	};

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<link
				href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap"
				rel="stylesheet"
			/>

			<Box
				sx={{
					minHeight: "100vh",
					background:
						"linear-gradient(160deg, #eef4fb 0%, #e4eef8 50%, #dde9f5 100%)",
					py: { xs: 3, md: 6 },
					px: { xs: 2, md: 3 },
				}}
			>
				{/* Header */}
				<Box
					sx={{
						textAlign: "center",
						mb: 5,
						maxWidth: 680,
						mx: "auto",
					}}
				>
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							mb: 2,
						}}
					>
						<Box
							sx={{
								width: 56,
								height: 56,
								borderRadius: "50%",
								background:
									"linear-gradient(135deg, #1a5c96, #2e7bc4)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								boxShadow: "0 8px 24px rgba(26,92,150,0.3)",
							}}
						>
							<PublicIcon sx={{ color: "#fff", fontSize: 30 }} />
						</Box>
					</Box>
					<Typography
						variant="h3"
						sx={{
							fontSize: { xs: "2rem", md: "2.6rem" },
							mb: 1,
							color: "primary.dark",
						}}
					>
						Humanitarian Activity Explorer
					</Typography>
					<Typography
						variant="body1"
						color="text.secondary"
						sx={{ fontSize: "1.05rem", maxWidth: 500, mx: "auto" }}
					>
						Filter sectors and activities to visualise where aid is
						being delivered across affected regions.
					</Typography>
				</Box>

				{/* Steps container */}
				<Box
					sx={{
						maxWidth: 760,
						mx: "auto",
						display: "flex",
						flexDirection: "column",
						gap: 2,
					}}
				>
					{/* ── Step 1: Sectors ── */}
					<Paper
						elevation={0}
						sx={{
							borderRadius: 4,
							border: "1.5px solid",
							borderColor:
								activeStep === 0
									? alpha("#e8732a", 0.4)
									: sectorsComplete
										? alpha("#1a5c96", 0.2)
										: alpha("#4a5f78", 0.1),
							p: { xs: 2.5, md: 3 },
							transition: "all 0.3s ease",
							boxShadow:
								activeStep === 0
									? "0 8px 32px rgba(232,115,42,0.08)"
									: "none",
						}}
					>
						<StepHeader
							number="1"
							title="Select Sectors"
							subtitle="Choose one or more UN allocation sectors to explore"
							active={activeStep === 0}
							done={sectorsComplete}
						/>

						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: {
									xs: "1fr 1fr",
									sm: "1fr 1fr 1fr",
									md: "1fr 1fr 1fr 1fr 1fr",
								},
								gap: 1.5,
							}}
						>
							{SECTORS.map(sector => (
								<SectorCard
									key={sector.id}
									sector={sector}
									selected={
										!!selectedSectors.find(
											s => s.id === sector.id,
										)
									}
									onClick={() => toggleSector(sector)}
								/>
							))}
						</Box>

						{selectedSectors.length > 0 && (
							<Fade in>
								<Box
									sx={{
										mt: 2,
										display: "flex",
										flexWrap: "wrap",
										gap: 0.75,
										alignItems: "center",
									}}
								>
									<Typography
										variant="caption"
										color="text.secondary"
										sx={{ mr: 0.5 }}
									>
										Selected:
									</Typography>
									{selectedSectors.map(s => (
										<Chip
											key={s.id}
											label={s.label}
											size="small"
											onDelete={() => toggleSector(s)}
											sx={{
												background: alpha(s.color, 0.1),
												color: s.color,
												borderColor: alpha(
													s.color,
													0.3,
												),
												border: "1px solid",
												fontWeight: 600,
												"& .MuiChip-deleteIcon": {
													color: s.color,
												},
											}}
										/>
									))}
								</Box>
							</Fade>
						)}
					</Paper>

					{/* ── Step 2: Activities ── */}
					<Paper
						elevation={0}
						sx={{
							borderRadius: 4,
							border: "1.5px solid",
							borderColor:
								activeStep === 1
									? alpha("#e8732a", 0.4)
									: activitiesComplete
										? alpha("#1a5c96", 0.2)
										: alpha("#4a5f78", 0.1),
							p: { xs: 2.5, md: 3 },
							transition: "all 0.3s ease",
							opacity: sectorsComplete ? 1 : 0.45,
							pointerEvents: sectorsComplete ? "auto" : "none",
							boxShadow:
								activeStep === 1
									? "0 8px 32px rgba(232,115,42,0.08)"
									: "none",
						}}
					>
						<StepHeader
							number="2"
							title="Select Activities"
							subtitle="Search and select specific humanitarian activities"
							active={activeStep === 1}
							done={activitiesComplete}
						/>

						{!sectorsComplete && (
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
									py: 1.5,
									px: 2,
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
									color="text.disabled"
									sx={{ fontStyle: "italic" }}
								>
									Complete Step 1 first to unlock activity
									selection.
								</Typography>
							</Box>
						)}

						{sectorsComplete && (
							<>
								<Autocomplete
									multiple
									options={activityOptions}
									getOptionLabel={o => o.label}
									value={selectedActivities}
									onChange={(_, val) =>
										setSelectedActivities(val)
									}
									inputValue={activityInput}
									onInputChange={(_, val) =>
										setActivityInput(val)
									}
									filterOptions={(opts, { inputValue }) =>
										opts
											.filter(o =>
												o.label
													.toLowerCase()
													.includes(
														inputValue.toLowerCase(),
													),
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
															?.startAdornment ||
															null}
													</>
												),
											}}
											sx={{
												"& .MuiOutlinedInput-root": {
													borderRadius: 2.5,
													background: alpha(
														"#1a5c96",
														0.03,
													),
													"&:hover fieldset": {
														borderColor:
															"primary.main",
													},
												},
											}}
										/>
									)}
									renderTags={() => null}
									renderOption={(
										props,
										option,
										{ selected },
									) => (
										<Box
											component="li"
											{...props}
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
															? "primary.main"
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
													{option.label}
												</Typography>
											</Box>
										</Box>
									)}
									ListboxProps={{ style: { maxHeight: 300 } }}
									noOptionsText="No matching activities found"
									sx={{
										mb:
											selectedActivities.length > 0
												? 2
												: 0,
									}}
								/>

								{selectedActivities.length > 0 && (
									<Fade in>
										<Box>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent:
														"space-between",
													mb: 1,
												}}
											>
												<Typography
													variant="caption"
													color="text.secondary"
												>
													{selectedActivities.length}{" "}
													activit
													{selectedActivities.length ===
													1
														? "y"
														: "ies"}{" "}
													selected
												</Typography>
												<Button
													size="small"
													onClick={() =>
														setSelectedActivities(
															[],
														)
													}
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
												{selectedActivities.map(a => (
													<Box
														key={a.id}
														sx={{
															display: "flex",
															alignItems:
																"flex-start",
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
																color: "primary.main",
																flexShrink: 0,
															}}
														/>
														<Typography
															variant="caption"
															sx={{
																lineHeight: 1.5,
																color: "text.primary",
																flex: 1,
															}}
														>
															{a.label}
														</Typography>
														<Box
															component="span"
															onClick={() =>
																setSelectedActivities(
																	prev =>
																		prev.filter(
																			x =>
																				x.id !==
																				a.id,
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
							</>
						)}
					</Paper>

					{/* ── Step 3: Map ── */}
					<Paper
						elevation={0}
						sx={{
							borderRadius: 4,
							border: "1.5px solid",
							borderColor: showMap
								? alpha("#1a5c96", 0.25)
								: alpha("#4a5f78", 0.1),
							p: { xs: 2.5, md: 3 },
							transition: "all 0.4s ease",
							opacity: showMap ? 1 : 0.45,
							pointerEvents: showMap ? "auto" : "none",
							boxShadow: showMap
								? "0 12px 40px rgba(26,92,150,0.1)"
								: "none",
						}}
					>
						<StepHeader
							number="3"
							title="Explore the Map"
							subtitle="View activity implementation sites across affected regions"
							active={showMap}
							done={false}
						/>

						{!showMap && (
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
									py: 1.5,
									px: 2,
									borderRadius: 2,
									background: alpha("#4a5f78", 0.05),
								}}
							>
								<MapIcon
									sx={{
										fontSize: 16,
										color: "text.disabled",
									}}
								/>
								<Typography
									variant="body2"
									color="text.disabled"
									sx={{ fontStyle: "italic" }}
								>
									Select sectors and activities above to
									reveal the map.
								</Typography>
							</Box>
						)}

						{showMap && (
							<Fade
								in
								timeout={600}
							>
								<Box>
									{/* Summary chips */}
									<Box
										sx={{
											display: "flex",
											flexWrap: "wrap",
											gap: 1,
											mb: 2,
										}}
									>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 0.5,
												flexWrap: "wrap",
											}}
										>
											<LayersIcon
												sx={{
													fontSize: 16,
													color: "primary.main",
												}}
											/>
											<Typography
												variant="caption"
												sx={{
													fontWeight: 600,
													color: "primary.main",
													mr: 0.5,
												}}
											>
												Sectors:
											</Typography>
											{selectedSectors.map(s => (
												<Chip
													key={s.id}
													label={s.label}
													size="small"
													sx={{
														height: 20,
														fontSize: "0.68rem",
														background: alpha(
															s.color,
															0.1,
														),
														color: s.color,
														fontWeight: 600,
													}}
												/>
											))}
										</Box>
									</Box>

									<MapPlaceholder
										sectors={selectedSectors}
										activities={selectedActivities}
									/>

									<Typography
										variant="caption"
										color="text.secondary"
										sx={{
											display: "block",
											textAlign: "center",
											mt: 1.5,
											fontStyle: "italic",
										}}
									>
										Replace this placeholder with your{" "}
										<Box
											component="span"
											sx={{
												fontWeight: 600,
												color: "primary.main",
											}}
										>
											react-leaflet
										</Box>{" "}
										map component — pass{" "}
										<code
											style={{
												fontFamily: "monospace",
												fontSize: "0.75rem",
											}}
										>
											selectedSectors
										</code>{" "}
										and{" "}
										<code
											style={{
												fontFamily: "monospace",
												fontSize: "0.75rem",
											}}
										>
											selectedActivities
										</code>{" "}
										as props.
									</Typography>
								</Box>
							</Fade>
						)}
					</Paper>
				</Box>
			</Box>
		</ThemeProvider>
	);
}
