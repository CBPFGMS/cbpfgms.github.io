import { select } from "d3-selection";
import { scaleLinear, scaleSqrt } from "d3-scale";
import { transition } from "d3-transition";
import colors from "../utils/colors";
import { format } from "d3-format";
import type { DatumCountries } from "../utils/processdatacountries";

type CreateMapParams = {
	data: DatumCountries[];
	svgGroupRef: React.RefObject<SVGGElement | null>;
	maxCircleRadius: number;
	maxValue: number;
	minCircleRadius: number;
};

const latLongSeparator = "|";

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

	const syncedTransition = transition().duration(750);

	let circles = svgGroup
		.selectAll<SVGCircleElement, DatumCountries>("circle")
		.data<DatumCountries>(
			data,
			d => d.latitude + latLongSeparator + d.longitude
		);

	circles.exit().transition(syncedTransition).attr("r", 0).remove();

	const circlesEnter = circles
		.enter()
		.append("circle")
		.attr("cx", d => longitudeScale(d.longitude) + "%")
		.attr("cy", d => latitudeScale(latitudeToMercator(d.latitude)) + "%")
		.attr("r", 0)
		.attr("data-tooltip-id", "tooltip")
		.attr("data-tooltip-html", createHtmlString())
		.attr("data-tooltip-place", "top")
		.attr("stroke", "black")
		.attr("stroke-width", 0.5)
		.attr("stroke-opacity", 0.5)
		.style("pointer-events", "auto");

	circles = circlesEnter.merge(circles);

	circles
		.transition(syncedTransition)
		.attr("cx", d => longitudeScale(d.longitude) + "%")
		.attr("cy", d => latitudeScale(latitudeToMercator(d.latitude)) + "%")
		.attr("r", d => radiusScale(d.allocations))
		.attr("fill", colors.ufeColor);
}

function createHtmlString(): string {
	const tooltipFormat = format(",");
	const tooltipFormatPercent = format(".0%");
	const totalTargeted = 0;
	const totalReached = 0;
	return `<span style="font-weight:bold;">Location: ${"foo"}</span><br>
	<div style="width:300px;display:flex;flex-direction:column;margin-top:10px;">
	<div style="display:flex;flex-direction:row;">
	<div style="flex: 0 20%"></div>
	<div style="flex: 0 40%;text-align:right;">Targeted</div>
	<div style="flex: 0 40%;text-align:right;">Reached</div>
	</div>
	<div style="display:flex;flex-direction:row;">
	<div style="flex: 0 20%">Girls</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(0)}</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(
		0
	)} <span style="font-size:10px;">(${tooltipFormatPercent(0)})</span></div>
	</div>
	<div style="display:flex;flex-direction:row;">
	<div style="flex: 0 20%">Boys</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(0)}</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(
		0
	)} <span style="font-size:10px;">(${tooltipFormatPercent(0)})</span></div>
	</div>
	<div style="display:flex;flex-direction:row;">
	<div style="flex: 0 20%">Women</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(0)}</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(
		0
	)} <span style="font-size:10px;">(${tooltipFormatPercent(0)})</span></div>
	</div>
	<div style="display:flex;flex-direction:row;">
	<div style="flex: 0 20%">Men</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(0)}</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(
		0
	)} <span style="font-size:10px;">(${tooltipFormatPercent(0)})</span></div>
	</div>
	<br>
	<div style="display:flex;flex-direction:row;">
	<div style="flex: 0 20%">Total</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(totalTargeted)}</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(
		totalReached
	)} <span style="font-size:10px;">(${tooltipFormatPercent(
		totalReached / totalTargeted
	)})</span></div>
	</div>
	</div>`;
}

function latitudeToMercator(latitude: number): number {
	const radians = latitude * (Math.PI / 180);
	const mercatorY = Math.log(Math.tan(radians / 2 + Math.PI / 4));
	return mercatorY;
}

export default createMap;
