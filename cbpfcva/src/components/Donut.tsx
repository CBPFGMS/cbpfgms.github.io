import { useState, useEffect, useRef } from "react";
import clipSlice from "../utils/clipslice";
import SliceAnimator from "./SliceAnimator";
import { pie } from "d3";
import { type DonutDatum } from "./TopFigures";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import NumberAnimator from "./NumberAnimator";
import colors from "../utils/colors";

type DonutProps = {
	totalSlice: number;
	CvaSlice: number;
	totalColor: string;
	CvaColor: string;
	showTotal?: boolean;
};

const pieGenerator = pie<void, DonutDatum>()
	.value(d => d.value)
	.sort(a => (a.type === "cva" ? -1 : 1));

function Donut({
	totalSlice,
	totalColor,
	CvaSlice,
	CvaColor,
	showTotal = true,
}: DonutProps) {
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

	const donutData: DonutDatum[] = [totalSlice, CvaSlice].map(
		(slice, index) => ({
			value: slice,
			type: index ? "cva" : "total",
		})
	);

	const pieData = pieGenerator(donutData);

	const CvaData = pieData.find(d => d.data.type === "cva")!;

	const CvaArc = clipSlice<DonutDatum>(diameter, CvaData);

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
				sliceColor={CvaColor}
				zIndex={50}
			/>
			<Box
				width={`${diameter / 1.8}px`}
				height={`${diameter / 1.8}px`}
				borderRadius={"50%"}
				position={"absolute"}
				zIndex={100}
				style={{
					backgroundColor: colors.paperColor,
				}}
				display={"flex"}
				justifyContent={"center"}
				alignItems={"center"}
			>
				{showTotal && (
					<Typography style={{ fontSize: "1em", fontWeight: "bold" }}>
						<NumberAnimator
							number={Math.round(
								(CvaSlice * 100) / (totalSlice + CvaSlice)
							)}
							numberType="integer"
						/>
						%
					</Typography>
				)}
			</Box>
		</Box>
	);
}

export default Donut;
