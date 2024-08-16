import { path, PieArcDatum } from "d3";
import { DonutDatum } from "../components/GBVChart";

const rotationAdjustment = Math.PI / 2;

function clipSlice(
	diameter: number,
	GBVSlice: PieArcDatum<DonutDatum>
): string {
	const radius = diameter / 2;

	const pathGenerator = path();

	const startAngle = GBVSlice.startAngle - rotationAdjustment;

	let endAngle = GBVSlice.endAngle - rotationAdjustment;

	if (startAngle === endAngle) {
		endAngle += 1e-5;
	}

	pathGenerator.moveTo(radius, radius);
	pathGenerator.arc(radius, radius, radius, startAngle, endAngle, false);
	pathGenerator.closePath();

	return pathGenerator.toString();
}

export default clipSlice;
