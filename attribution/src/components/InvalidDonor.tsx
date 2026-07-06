import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type InvalidDonorProps = {
	setDonor: React.Dispatch<React.SetStateAction<number | null>>;
};

function InvalidDonor({ setDonor }: InvalidDonorProps) {
	return (
		<Box>
			<Typography
				variant="h6"
				component="h1"
				gutterBottom
			>
				Invalid Donor
			</Typography>
			<Typography
				variant="body1"
				component="p"
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
				Go Back
			</Button>
		</Box>
	);
}

export default InvalidDonor;
