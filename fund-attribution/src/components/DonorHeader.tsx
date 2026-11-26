import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { List } from "../utils/makelists";

type DonorHeaderProps = {
	fund: number;
	lists: List;
};

function DonorHeader({ fund, lists }: DonorHeaderProps) {
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
			<title>{`${lists.fundNames[fund]} attribution overview`}</title>
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
				{lists.fundNames[fund]}
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
				Attribution overview
			</Typography>
		</Box>
	);
}

export default DonorHeader;
