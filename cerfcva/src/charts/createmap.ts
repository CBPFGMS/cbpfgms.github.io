import { select } from "d3-selection";
import { scaleLinear, scaleSqrt } from "d3-scale";
import colors from "../utils/colors";
import type { DatumCountries } from "../utils/processdatacountries";
import { pie, arc, type PieArcDatum } from "d3-shape";
import { type AllocationWindows } from "../utils/processdatasummary";

type CreateMapParams = {
	data: DatumCountries[];
	svgGroupRef: React.RefObject<SVGGElement | null>;
	maxCircleRadius: number;
	maxValue: number;
	minCircleRadius: number;
};

type DonutDatum = {
	type: AllocationWindows;
	value: number;
	outerRadius: number;
};

const allocationTypes: AllocationWindows[] = ["rr", "ufe"];

const strokeOpacityValue = 0.8,
	fillOpacityValue = 0.5;

function createMap({
	data,
	svgGroupRef,
	maxCircleRadius,
	maxValue,
	minCircleRadius,
}: CreateMapParams): void {
	const svgGroup = select(svgGroupRef.current);

	const latitudeScale = scaleLinear<number>()
		.domain([latitudeToMercator(85), latitudeToMercator(-85)])
		.range([0, 100]);
	const longitudeScale = scaleLinear<number>()
		.domain([-180, 180])
		.range([0, 100]);
	const radiusScale = scaleSqrt<number>()
		.domain([0, maxValue])
		.range([minCircleRadius, maxCircleRadius]);

	// let circles = svgGroup
	// 	.selectAll<SVGCircleElement, DatumCountries>("circle")
	// 	.data<DatumCountries>(
	// 		data,
	// 		d => d.latitude + latLongSeparator + d.longitude
	// 	);

	// circles.exit().transition(syncedTransition).attr("r", 0).remove();

	// const circlesEnter = circles
	// 	.enter()
	// 	.append("svg")
	// 	.style("overflow", "visible")
	// 	.attr("x", d => longitudeScale(d.longitude) + "%")
	// 	.attr("y", d => latitudeScale(latitudeToMercator(d.latitude)) + "%");

	// circlesEnter.append("circle")
	// 	.attr("r", 0)
	// 	.attr("data-tooltip-id", "tooltip")
	// 	.attr("data-tooltip-html", createHtmlString())
	// 	.attr("data-tooltip-place", "top")
	// 	.attr("stroke", "black")
	// 	.attr("stroke-width", 0.5)
	// 	.attr("stroke-opacity", 0.5)
	// 	.style("pointer-events", "auto");

	// circles = circlesEnter.merge(circles);

	// circles
	// 	.transition(syncedTransition)
	// 	.attr("x", d => longitudeScale(d.longitude) + "%")
	// 	.attr("y", d => latitudeScale(latitudeToMercator(d.latitude)) + "%")
	// 	.attr("r", d => radiusScale(d.allocations))
	// 	.attr("fill", colors.ufeColor);

	// PATHS

	const pieGenerator = pie<DonutDatum>()
		.value(d => d.value)
		.sort(null);

	const arcGenerator = arc<PieArcDatum<DonutDatum>>()
		.innerRadius(0)
		.outerRadius(d => d.data.outerRadius);

	let pieGroup = svgGroup
		.selectAll<SVGGElement, DatumCountries>(".pieGroup")
		.data<DatumCountries>(data, d => d.country);

	pieGroup.exit().remove();

	const pieGroupEnter = pieGroup
		.enter()
		.append("svg")
		.attr("class", "pieGroup")
		.style("opacity", 1)
		.style("overflow", "visible")
		.attr("x", d => longitudeScale(d.longitude) + "%")
		.attr("y", d => latitudeScale(latitudeToMercator(d.latitude)) + "%")
		.append("g");

	pieGroup = pieGroupEnter.merge(pieGroup);

	pieGroup.order();

	let slices = pieGroup
		.selectAll<SVGPathElement, PieArcDatum<DonutDatum>>(".slice")
		.data<PieArcDatum<DonutDatum>>(
			d => {
				const datum: DonutDatum[] = allocationTypes
					.map(type => ({
						value: d[type],
						type,
						outerRadius: radiusScale(d.allocations),
					}))
					.filter(e => e.value !== 0);
				return pieGenerator(datum);
			},
			d => d.data.type
		);

	slices.exit().remove();

	const slicesEnter = slices
		.enter()
		.append("path")
		.attr("class", "slice")
		.style(
			"fill",
			d => colors[(d.data.type + "Color") as keyof typeof colors]
		)
		.style("stroke", "#666")
		.style("stroke-width", "1px")
		.style("stroke-opacity", strokeOpacityValue)
		.style("fill-opacity", fillOpacityValue)
		.attr("d", d => arcGenerator(d));

	slices = slicesEnter.merge(slices);

	slices.attr("d", d => arcGenerator(d));
}

function latitudeToMercator(latitude: number): number {
	const radians = latitude * (Math.PI / 180);
	const mercatorY = Math.log(Math.tan(radians / 2 + Math.PI / 4));
	return mercatorY;
}

export default createMap;
