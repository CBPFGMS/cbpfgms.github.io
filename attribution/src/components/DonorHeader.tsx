import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { List } from "../utils/makelists";

type DonorHeaderProps = {
	donor: number;
	lists: List;
	flagSrc: string;
};

function DonorHeader({ donor, lists, flagSrc }: DonorHeaderProps) {

	return (
		<Box
			sx={{
				width: "100%",
				display: "flex",
				justifyContent: "center",
				flexDirection: "column",
				alignItems: "center",
				marginTop: "5em",
			}}
		>
			<img
				src={flagSrc}
				width="76px"
				style={{
					borderRadius: "0.3rem",
					boxShadow: "0 0.5rem 0.5rem rgba(0, 0, 0, 0.1)",
				}}
				alt={`${lists.donorGMSNames[donor]} flag`}
			/>
			<Typography
				sx={{
					fontSize: "3.5em",
					fontWeight: 300,
					textTransform: "uppercase",
					fontFamily: "Helvetica",
					lineHeight: 1.2,
					marginTop: "0.4em",
					textAlign: "center",
				}}
			>
				{lists.donorGMSNames[donor]}
			</Typography>
			<Typography
				sx={{
					fontSize: "1em",
					fontWeight: 300,
					textTransform: "uppercase",
					fontFamily: "Helvetica",
					color: "#212529bf",
				}}
			>
				Donor attribution overview
			</Typography>
		</Box>
	);
}

export default DonorHeader;
