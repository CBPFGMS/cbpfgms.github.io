import { select } from "d3-selection";
import { scaleLinear, scaleSqrt } from "d3-scale";
import { format } from "d3-format";
import colors from "../utils/colors";
import type { DatumCountries } from "../utils/processdatacountries";
import { pie, arc, type PieArcDatum } from "d3-shape";
import { type AllocationWindows } from "../utils/processdatasummary";
import type { List } from "../utils/makelists";

type CreateMapParams = {
	data: DatumCountries[];
	svgGroupRef: React.RefObject<SVGGElement | null>;
	maxCircleRadius: number;
	maxValue: number;
	minCircleRadius: number;
	lists: List;
};

type DonutDatum = {
	type: AllocationWindows;
	value: number;
	outerRadius: number;
};

const allocationTypes: AllocationWindows[] = ["rr", "ufe"];

const strokeOpacityValue = 0.8,
	fillOpacityValue = 0.5;

const tooltipFormat = format(","),
	tooltipFormatPercent = format(".0%");

function createMap({
	data,
	svgGroupRef,
	maxCircleRadius,
	maxValue,
	minCircleRadius,
	lists,
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
		.style("pointer-events", "all")
		.attr("class", "pieGroup")
		.style("opacity", 1)
		.style("overflow", "visible")
		.attr("x", d => longitudeScale(d.longitude) + "%")
		.attr("y", d => latitudeScale(latitudeToMercator(d.latitude)) + "%")
		.append("g")
		.attr("data-tooltip-id", "tooltip")
		.attr("data-tooltip-html", d => createHtmlString(d, lists))
		.attr("data-tooltip-place", "top")
		.style("pointer-events", "all");

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
		.style("pointer-events", "all")
		.attr("d", d => arcGenerator(d));

	slices = slicesEnter.merge(slices);

	slices.attr("d", d => arcGenerator(d));
}

function latitudeToMercator(latitude: number): number {
	const radians = latitude * (Math.PI / 180);
	const mercatorY = Math.log(Math.tan(radians / 2 + Math.PI / 4));
	return mercatorY;
}

function createHtmlString(d: DatumCountries, lists: List): string {
	return `<span style="font-weight:bold;">Location: ${
		lists.fundNames[d.country]
	}</span><br>
	<div style="width:330px;display:flex;flex-direction:column;margin-top:10px;">
	<div style="display:flex;flex-direction:row;">
	<div style="flex: 0 68%;text-align:left;">Allocation Window</div>
	<div style="flex: 0 32%;text-align:right;outline:1px solid #fff;">Value</div>
	</div>
	<div style="display:flex;flex-direction:row;">
	<div style="flex: 0 68%;text-align:left;">Rapid Response <span style="font-size:11px;">(${tooltipFormatPercent(
		d.rr / d.allocations
	)})</span>:</div>
	<div style="flex: 0 32%;text-align:right;">$${tooltipFormat(d.rr)} </div>
	</div>
	<div style="display:flex;flex-direction:row;">
	<div style="flex: 0 68%;text-align:left;">Underfunded Emergencies <span style="font-size:10px;">(${tooltipFormatPercent(
		d.ufe / d.allocations
	)})</span>:</div>
	<div style="flex: 0 32%;text-align:right;">$${tooltipFormat(d.ufe)} </div>
	</div>
	</div>`;
}

export default createMap;
