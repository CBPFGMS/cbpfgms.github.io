import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import LaunchIcon from "@mui/icons-material/Launch";

type AttributionCardExplanationProps = {
	open: boolean;
	onClose: () => void;
};

const exampleButtonMarkerStyles = {
	width: 18,
	height: 18,
	borderRadius: "50%",
	display: "grid",
	placeItems: "center",
	flexShrink: 0,
	backgroundColor: "#185fa5",
	color: "white",
	fontSize: 11,
	fontWeight: 700,
};

const explanations = [
	{
		number: "1",
		title: "Add or remove this donor",
		text: "Use this button to include or remove the donor from the current selection.",
	},
	{
		number: "2",
		title: "Keep only this donor",
		text: "Show this donor on its own by removing all the other donors from the current selection.",
	},
	{
		number: "3",
		title: "Open donor attribution",
		text: "Go to the attribution page for this donor.",
	},
	{
		number: "4",
		title: "Donor",
		text: "The name (and flag, when applicable) of the donor represented by this card.",
	},
	{
		number: "5",
		title: "Share attributed to this fund",
		text: "This percentage shows how much of the donor's total contribution went to the fund being viewed. The calculation is done dividing the amount donated to the fund being viewed by the total donations from this donor to all other funds.",
	},
	{
		number: "6",
		title: "Amount for this fund",
		text: "The amount in parentheses is the donor's actual contribution to this fund.",
	},
	{
		number: "7",
		title: "Total across all funds",
		text: "The dark bar shows the fund's share of the donor's total contributions. The amount below it (light gray bar) is that total donated by the donor to all funds.",
	},
];

function AttributionCardExplanation({
	open,
	onClose,
}: AttributionCardExplanationProps) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="lg"
			aria-labelledby="attribution-card-explanation-title"
			scroll="paper"
		>
			<DialogTitle
				id="attribution-card-explanation-title"
				sx={{ pr: 7 }}
			>
				How to read an attribution card
				<IconButton
					aria-label="Close explanation"
					onClick={onClose}
					sx={{
						position: "absolute",
						right: 8,
						top: 8,
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent dividers>
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ mb: 2 }}
				>
					Illustrative example — values are for demonstration only.
				</Typography>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "1fr 2fr",
						gap: 2,
						alignItems: "stretch",
						pb: 1,
					}}
				>
					<Card
						variant="outlined"
						sx={{
							borderRadius: 2,
							backgroundColor: "#f7fbff",
							borderColor: "#b5d4f4",
							alignSelf: "start",
						}}
					>
						<CardContent
							sx={{
								display: "flex",
								flexDirection: "column",
								gap: 2.5,
								"&:last-child": { pb: 2 },
							}}
						>
							<Box
								sx={{
									display: "flex",
									width: "100%",
									alignItems: "center",
									gap: 0.5,
								}}
							>
								<Box
									className="attrib-remove-btn attrib-rb-blue"
									sx={{
										display: "flex",
										flex: 1,
										alignItems: "center",
										justifyContent: "center",
										gap: 0.5,
									}}
								>
									Remove
									<Box
										component="span"
										sx={exampleButtonMarkerStyles}
									>
										1
									</Box>
								</Box>
								<Box
									className="attrib-remove-btn attrib-rb-blue"
									sx={{
										display: "flex",
										flex: 1,
										alignItems: "center",
										justifyContent: "center",
										gap: 0.5,
									}}
								>
									Keep Only
									<Box
										component="span"
										sx={exampleButtonMarkerStyles}
									>
										2
									</Box>
								</Box>
								<Box
									className="attrib-remove-btn attrib-rb-blue"
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: 0.5,
										padding: "3px",
									}}
								>
									<LaunchIcon fontSize="small" />
									<Box
										component="span"
										sx={exampleButtonMarkerStyles}
									>
										3
									</Box>
								</Box>
							</Box>

							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
								}}
							>
								<Box
									aria-hidden="true"
									sx={{
										width: 32,
										height: 24,
										borderRadius: 0.5,
										backgroundColor: "#d9e8f7",
										border: "1px solid #b5d4f4",
										flexShrink: 0,
									}}
								/>
								<Typography
									variant="h6"
									sx={{ color: "#185fa5", lineHeight: 1.2 }}
								>
									Donor name
								</Typography>
								<Box
									component="span"
									sx={{
										ml: "auto",
										width: 24,
										height: 24,
										borderRadius: "50%",
										display: "grid",
										placeItems: "center",
										backgroundColor: "#185fa5",
										color: "white",
										fontSize: 13,
										fontWeight: 700,
									}}
								>
									4
								</Box>
							</Box>

							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 1,
								}}
							>
								<Typography
									variant="h5"
									sx={{ color: "#185fa5", fontWeight: 600 }}
								>
									35%
								</Typography>
								<Box
									component="span"
									sx={{
										width: 24,
										height: 24,
										borderRadius: "50%",
										display: "grid",
										placeItems: "center",
										backgroundColor: "#185fa5",
										color: "white",
										fontSize: 13,
										fontWeight: 700,
									}}
								>
									5
								</Box>
								<Typography
									variant="body1"
									sx={{ color: "#185fa5" }}
								>
									($350,000)
								</Typography>
								<Box
									component="span"
									sx={{
										width: 24,
										height: 24,
										borderRadius: "50%",
										display: "grid",
										placeItems: "center",
										backgroundColor: "#185fa5",
										color: "white",
										fontSize: 13,
										fontWeight: 700,
									}}
								>
									6
								</Box>
							</Box>

							<Box>
								<Box
									sx={{
										height: 10,
										borderRadius: 5,
										backgroundColor: "#e1e1e1",
										overflow: "hidden",
									}}
								>
									<Box
										sx={{
											width: "35%",
											height: "100%",
											borderRadius: 5,
											backgroundColor: "#1f69b3",
										}}
									/>
								</Box>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										mt: 0.75,
									}}
								>
									<Typography
										variant="body2"
										sx={{
											color: "#185fa5",
											fontWeight: 600,
										}}
									>
										$1,000,000
									</Typography>
									<Box
										component="span"
										sx={{
											width: 24,
											height: 24,
											borderRadius: "50%",
											display: "grid",
											placeItems: "center",
											backgroundColor: "#185fa5",
											color: "white",
											fontSize: 13,
											fontWeight: 700,
										}}
									>
										7
									</Box>
								</Box>
							</Box>
						</CardContent>
					</Card>

					<Box sx={{ display: "grid", gap: 1 }}>
						{explanations.map(explanation => (
							<Paper
								key={explanation.number}
								variant="outlined"
								sx={{
									display: "flex",
									gap: 1.5,
									alignItems: "flex-start",
									p: 1.5,
									borderRadius: 2,
								}}
							>
								<Box
									component="span"
									sx={{
										width: 28,
										height: 28,
										borderRadius: "50%",
										display: "grid",
										placeItems: "center",
										flexShrink: 0,
										backgroundColor: "#eaf3fb",
										color: "#185fa5",
										fontWeight: 700,
									}}
								>
									{explanation.number}
								</Box>
								<Box>
									<Typography
										variant="subtitle2"
										sx={{ mb: 0.25 }}
									>
										{explanation.title}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										{explanation.text}
									</Typography>
								</Box>
							</Paper>
						))}
					</Box>
				</Box>
			</DialogContent>
		</Dialog>
	);
}

export default AttributionCardExplanation;
