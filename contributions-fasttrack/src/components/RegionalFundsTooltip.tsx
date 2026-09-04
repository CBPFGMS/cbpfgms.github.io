import Popper from "@mui/material/Popper";
import Fade from "@mui/material/Fade";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import type { List } from "../utils/makelists";
import type { TopValuesDatum } from "../utils/processtopvalues";
import Box from "@mui/material/Box";

type RegionalFundsTooltipProps = {
	topValuesDatum: TopValuesDatum;
	lists: List;
	anchorEl: HTMLElement | null;
};

function RegionalFundsTooltip({
	topValuesDatum,
	lists,
	anchorEl,
}: RegionalFundsTooltipProps) {
	const regionalFundsArray = Array.from(
		topValuesDatum.fundsPerRegionalFund.keys(),
	);

	const open = Boolean(anchorEl);

	return (
		<Popper
			open={open}
			anchorEl={anchorEl}
			placement="top"
			transition
			sx={{ zIndex: 1300 }}
		>
			{({ TransitionProps }) => (
				<Fade
					{...TransitionProps}
					timeout={200}
				>
					<Card
						elevation={2}
						sx={{
							borderRadius: "8px",
							maxWidth: "420px",
							border: "1px solid #ccc",
						}}
					>
						<CardContent
							sx={{
								padding: "0.8em 1em",
								display: "flex",
								flexDirection: "column",
								gap: "12px",
							}}
						>
							{regionalFundsArray.map(regionalFund => {
								const fundsInThisRegional = Array.from(
									topValuesDatum.fundsPerRegionalFund.get(
										regionalFund,
									) || [],
								);
								return (
									<Box>
										<Typography
											sx={{
												fontSize: "15px",
												fontWeight: 600,
												color: "#333",
											}}
										>
											{
												lists.regionalFundNames[
													regionalFund
												]
											}
										</Typography>
										<Typography
											sx={{
												fontSize: "14px",
												color: "#666",
											}}
										>
											{`${fundsInThisRegional.length} country envelope${fundsInThisRegional.length !== 1 ? "s" : ""}:`}
										</Typography>
										{fundsInThisRegional.map(fund => (
											<Typography
												key={fund}
												sx={{
													fontSize: "14px",
													color: "#555",
													lineHeight: 1.4,
													marginLeft: "8px",
												}}
											>
												{"- "}
												{lists.fundNames[fund]}
											</Typography>
										))}
									</Box>
								);
							})}
						</CardContent>
					</Card>
				</Fade>
			)}
		</Popper>
	);
}

export default RegionalFundsTooltip;
