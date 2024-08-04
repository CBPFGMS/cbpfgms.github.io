import { path, PieArcDatum } from "d3";
import { DonutDatum } from "../components/GBVChart";

const rotationAdjustment = Math.PI / 2;

function clipSlice(
	diameter: number,
	GBVSlice: PieArcDatum<DonutDatum>
): string {
	const radius = diameter / 2;

	const pathGenerator = path();

	pathGenerator.moveTo(radius, radius);
	pathGenerator.arc(
		radius,
		radius,
		radius,
		GBVSlice.startAngle - rotationAdjustment,
		GBVSlice.endAngle - rotationAdjustment,
		false
	);
	pathGenerator.closePath();

	return pathGenerator.toString();
}

export default clipSlice;
