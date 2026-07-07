import { useMemo } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { useAppData } from "../hooks/useappdata";
import colors from "../utils/colors";
import { flags } from "../assets/flags24";
import { addQueryParam } from "../utils/querystrings";

type Donor = {
	donorName: string;
	donorISOCode: string | null;
	donorID: number;
};

type DonorSelectorProps = {
	setDonor: React.Dispatch<React.SetStateAction<number | null>>;
};

function DonorSelector({ setDonor }: DonorSelectorProps) {
	const { inContributionsDataLists, lists } = useAppData();

	const data: Donor[] = [...inContributionsDataLists.donors].map(d => ({
		donorName: lists.donorGMSNames[d],
		donorISOCode: lists.donorISO2Codes[d],
		donorID: d,
	}));

	const groupedDonors = useMemo(() => {
		const groups: Record<string, Donor[]> = {};

		[...data]
			.sort((a, b) => a.donorName.localeCompare(b.donorName))
			.forEach(donor => {
				const letter = donor.donorName.charAt(0).toUpperCase();

				if (!groups[letter]) {
					groups[letter] = [];
				}

				groups[letter].push({
					donorName: donor.donorName,
					donorISOCode: donor.donorISOCode,
					donorID: donor.donorID,
				});
			});

		return groups;
	}, [data]);

	const letters = Object.keys(groupedDonors).sort();

	return (
		<Container maxWidth="lg">
			<Box>
				<Box
					sx={{
						paddingLeft: { xs: 3, md: 5 },
						paddingBottom: { xs: 1, md: 2 },
					}}
				>
					<Typography
						component="h1"
						sx={{
							fontSize: { xs: "1.75rem", md: "2.25rem" },
							fontWeight: 700,
							letterSpacing: "-0.02em",
							color: "text.primary",
						}}
					>
						Select a Donor
					</Typography>
					<Divider
						sx={{
							mt: 2,
							borderColor: "transparent",
							height: 3,
							width: 56,
							borderRadius: 2,
							background: theme =>
								`linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
						}}
					/>
				</Box>

				<Box
					sx={{
						p: { xs: 3, md: 5 },
					}}
				>
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "1fr",
								sm: "repeat(2, 1fr)",
								lg: "repeat(3, 1fr)",
								xl: "repeat(4, 1fr)",
							},
							gap: 4,
						}}
					>
						{letters.map(letter => (
							<Box key={letter}>
								<Typography
									variant="h5"
									sx={{
										fontWeight: 700,
										color: colors.unColor,
										mb: 2,
										pb: 1,
										borderBottom: theme =>
											`1px solid ${theme.palette.divider}`,
									}}
								>
									{letter}
								</Typography>

								<Stack spacing={1}>
									{groupedDonors[letter].map(donor => (
										<Link
											key={donor.donorName}
											component="button"
											underline="none"
											onClick={() => {
												addQueryParam(donor.donorID);
												setDonor(donor.donorID);
											}}
											sx={{
												display: "inline-flex",
												alignItems: "center",
												textAlign: "left",
												fontSize: "0.95rem",
												color: "text.primary",
												py: 0.5,
												px: 1,
												borderRadius: 1.5,
												transition: "all 0.2s ease",
												"&:hover": {
													backgroundColor:
														"action.hover",
													color: "primary.main",
													transform:
														"translateX(4px)",
												},
											}}
										>
											{donor.donorISOCode && (
												<img
													src={
														flags[
															donor.donorISOCode.toLowerCase()
														]
													}
													style={{
														width: 24,
														height: 24,
														paddingRight: "0.5em",
													}}
												/>
											)}
											{donor.donorName}
										</Link>
									))}
								</Stack>
							</Box>
						))}
					</Box>
				</Box>
			</Box>
		</Container>
	);
}

export default DonorSelector;
