import { useState, useEffect, useRef } from "react";
import clipSlice from "../utils/clipslice";
import SliceAnimator from "./SliceAnimator";
import { pie } from "d3";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import NumberAnimator from "./NumberAnimator";

type CvaDonutDatum = {
	value: number;
	type: "total" | "CVA";
};

type DonutProps = {
	totalSlice: number;
	cvaSlice: number;
	totalColor: string;
	cvaColor: string;
};

const pieGenerator = pie<void, CvaDonutDatum>()
	.value(d => d.value)
	.sort(a => (a.type === "CVA" ? -1 : 1));

function Donut({ totalSlice, totalColor, cvaSlice, cvaColor }: DonutProps) {
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

	const donutData: CvaDonutDatum[] = [totalSlice, cvaSlice].map(
		(slice, index) => ({
			value: slice,
			type: index ? "CVA" : "total",
		})
	);

	const pieData = pieGenerator(donutData);

	const CvaData = pieData.find(d => d.data.type === "CVA")!;

	const CvaArc = clipSlice<CvaDonutDatum>(diameter, CvaData);

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
				sliceArc={CvaArc}
				sliceColor={cvaColor}
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
						number={~~((cvaSlice * 1000) / totalSlice) / 10}
						type="decimal"
					/>
					%
				</Typography>
			</Box>
		</Box>
	);
}

export default Donut;
