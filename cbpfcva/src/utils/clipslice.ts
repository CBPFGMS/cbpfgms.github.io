import { path, type PieArcDatum } from "d3";

const rotationAdjustment = Math.PI / 2;

function clipSlice<T>(diameter: number, slice: PieArcDatum<T>): string {
	const radius = diameter / 2;

	const pathGenerator = path();

	const startAngle = slice.startAngle - rotationAdjustment;

	let endAngle = slice.endAngle - rotationAdjustment;

	if (startAngle === endAngle) {
		endAngle += 1e-5;
	}

	pathGenerator.moveTo(radius, radius);
	pathGenerator.arc(radius, radius, radius, startAngle, endAngle, false);
	pathGenerator.closePath();

	return pathGenerator.toString();
}

export default clipSlice;
