import { useState, useEffect } from "react";
import { DatumIndicators } from "../utils/processdataindicators";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

type CarouselProps = {
	data: DatumIndicators[];
};

function Carousel({ data }: CarouselProps) {
	return (
		<Paper
			elevation={0}
			style={{
				width: "100%",
				padding: "1em",
				backgroundColor: "#f8f8f8",
				borderRadius: "8px",
				position: "relative",
			}}
		>
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
			>
				<Typography
					variant="h4"
					style={{
						marginBottom: "1em",
					}}
				>
					Carousel
				</Typography>
			</Box>
		</Paper>
	);
}

export default Carousel;
