import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

type InvalidDonorProps = {
	setDonor: React.Dispatch<React.SetStateAction<number | null>>;
};

function InvalidDonor({ setDonor }: InvalidDonorProps) {
	return (
		<Container
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				paddingTop: "4em",
				gap: "1em",
			}}
		>
			<Typography
				variant="h5"
				gutterBottom
				sx={{
					textTransform: "uppercase",
				}}
			>
				Invalid Donor
			</Typography>
			<Typography
				variant="body1"
				gutterBottom
			>
				The donor you are looking for is not in our database. Please try
				again.
			</Typography>
			<Button
				variant="contained"
				color="primary"
				onClick={() => setDonor(null)}
			>
				Select donor
			</Button>
		</Container>
	);
}

export default InvalidDonor;
