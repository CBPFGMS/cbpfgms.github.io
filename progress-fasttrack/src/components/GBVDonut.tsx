import { useState, useEffect, useRef } from "react";
import clipSlice from "../utils/clipslice";
import SliceAnimator from "./SliceAnimator";
import { pie } from "d3";
import { DonutDatum } from "./GBVChart";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import NumberAnimator from "./NumberAnimator";

type DonutProps = {
	totalSlice: number;
	GBVSlice: number;
	totalColor: string;
	GBVColor: string;
};

const pieGenerator = pie<void, DonutDatum>()
	.value(d => d.value)
	.sort(a => (a.type === "GBV" ? -1 : 1));

function Donut({ totalSlice, totalColor, GBVSlice, GBVColor }: DonutProps) {
	const parentRef = useRef<HTMLDivElement>(null);
	const [parentWidth, setParentWidth] = useState<number>(0);
	const [parentHeight, setParentHeight] = useState<number>(0);

	useEffect(() => {
		if (parentRef.current) {
			setParentWidth(parentRef.current.offsetWidth);
			setParentHeight(parentRef.current.offsetHeight);
		}
	}, []);

	const diameter = Math.min(parentWidth, parentHeight);

	const donutData: DonutDatum[] = [totalSlice, GBVSlice].map(
		(slice, index) => ({
			value: slice,
			type: index ? "GBV" : "total",
		})
	);

	const pieData = pieGenerator(donutData);

	const GBVData = pieData.find(d => d.data.type === "GBV")!;

	const GBVArc = clipSlice<DonutDatum>(diameter, GBVData);

	return (
		<Box
			width={"100%"}
			height={"100%"}
			ref={parentRef}
			display={"flex"}
			justifyContent={"center"}
			alignItems={"center"}
			position={"relative"}
		>
			<Box
				width={`${diameter}px`}
				height={`${diameter}px`}
				borderRadius={"50%"}
				position={"absolute"}
				zIndex={10}
				style={{
					backgroundColor: totalColor,
				}}
			/>
			<SliceAnimator
				diameter={diameter}
				sliceArc={GBVArc}
				sliceColor={GBVColor}
				zIndex={50}
			/>
			<Box
				width={`${diameter / 2}px`}
				height={`${diameter / 2}px`}
				borderRadius={"50%"}
				position={"absolute"}
				zIndex={100}
				style={{
					backgroundColor: "#fff",
				}}
				display={"flex"}
				justifyContent={"center"}
				alignItems={"center"}
			>
				<Typography style={{ fontSize: "0.9em", fontWeight: "bold" }}>
					<NumberAnimator
						number={~~((GBVSlice * 1000) / totalSlice) / 10}
						type="decimal"
					/>
					%
				</Typography>
			</Box>
		</Box>
	);
}

export default Donut;
