import { select } from "d3-selection";
import { scaleLinear, scaleSqrt } from "d3-scale";
import { transition } from "d3-transition";
import { interpolateRgb } from "d3-interpolate";
import colors from "../utils/colors";
import { format } from "d3-format";

function createMap({
	data,
	svgGroupRef,
	maxCircleRadius,
	maxValue,
	minCircleRadius,
}: CreateMapParams): void {
	const svgGroup = select(svgGroupRef.current);

	const minValueColor = "#eee",
		maxMarkerColor = colors.contrastColorDarker,
		colorInterpolator = interpolateRgb(minValueColor, maxMarkerColor);

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
		.selectAll<SVGCircleElement, MapData>("circle")
		.data<MapData>(data, d => d.locationId);

	circles.exit().transition(syncedTransition).attr("r", 0).remove();

	const circlesEnter = circles
		.enter()
		.append("circle")
		.attr("cx", d => longitudeScale(d.coordinates[1]) + "%")
		.attr(
			"cy",
			d => latitudeScale(latitudeToMercator(d.coordinates[0])) + "%"
		)
		.attr("r", 0)
		.attr("data-tooltip-id", "tooltip-map")
		.attr("data-tooltip-html", d => createHtmlString(d))
		.attr("data-tooltip-place", "top")
		.attr("stroke", "black")
		.attr("stroke-width", 0.5)
		.attr("stroke-opacity", 0.5)
		.style("pointer-events", "auto");

	circles = circlesEnter.merge(circles);

	circles
		.transition(syncedTransition)
		.attr("cx", d => longitudeScale(d.coordinates[1]) + "%")
		.attr(
			"cy",
			d => latitudeScale(latitudeToMercator(d.coordinates[0])) + "%"
		)
		.attr("r", d =>
			radiusScale(
				d.beneficiaries.targetedBoys +
					d.beneficiaries.targetedGirls +
					d.beneficiaries.targetedMen +
					d.beneficiaries.targetedWomen
			)
		)
		.attr("fill", d =>
			colorInterpolator(
				Math.min(
					1,
					(d.beneficiaries.reachedBoys +
						d.beneficiaries.reachedGirls +
						d.beneficiaries.reachedMen +
						d.beneficiaries.reachedWomen) /
						(d.beneficiaries.targetedBoys +
							d.beneficiaries.targetedGirls +
							d.beneficiaries.targetedMen +
							d.beneficiaries.targetedWomen)
				)
			)
		);
}

function createHtmlString(d: MapData): string {
	const tooltipFormat = format(",");
	const tooltipFormatPercent = format(".0%");
	const totalTargeted =
		d.beneficiaries.targetedBoys +
		d.beneficiaries.targetedGirls +
		d.beneficiaries.targetedMen +
		d.beneficiaries.targetedWomen;
	const totalReached =
		d.beneficiaries.reachedBoys +
		d.beneficiaries.reachedGirls +
		d.beneficiaries.reachedMen +
		d.beneficiaries.reachedWomen;
	return `<span style="font-weight:bold;">Location: ${
		d.locationName
	}</span><br>
	<div style="width:300px;display:flex;flex-direction:column;margin-top:10px;">
	<div style="display:flex;flex-direction:row;">
	<div style="flex: 0 20%"></div>
	<div style="flex: 0 40%;text-align:right;">Targeted</div>
	<div style="flex: 0 40%;text-align:right;">Reached</div>
	</div>
	<div style="display:flex;flex-direction:row;">
	<div style="flex: 0 20%">Girls</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(
		d.beneficiaries.targetedGirls
	)}</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(
		d.beneficiaries.reachedGirls
	)} <span style="font-size:10px;">(${tooltipFormatPercent(
		d.beneficiaries.reachedGirls / d.beneficiaries.targetedGirls
	)})</span></div>
	</div>
	<div style="display:flex;flex-direction:row;">
	<div style="flex: 0 20%">Boys</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(
		d.beneficiaries.targetedBoys
	)}</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(
		d.beneficiaries.reachedBoys
	)} <span style="font-size:10px;">(${tooltipFormatPercent(
		d.beneficiaries.reachedBoys / d.beneficiaries.targetedBoys
	)})</span></div>
	</div>
	<div style="display:flex;flex-direction:row;">
	<div style="flex: 0 20%">Women</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(
		d.beneficiaries.targetedWomen
	)}</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(
		d.beneficiaries.reachedWomen
	)} <span style="font-size:10px;">(${tooltipFormatPercent(
		d.beneficiaries.reachedWomen / d.beneficiaries.targetedWomen
	)})</span></div>
	</div>
	<div style="display:flex;flex-direction:row;">
	<div style="flex: 0 20%">Men</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(
		d.beneficiaries.targetedMen
	)}</div>
	<div style="flex: 0 40%;text-align:right;">${tooltipFormat(
		d.beneficiaries.reachedMen
	)} <span style="font-size:10px;">(${tooltipFormatPercent(
		d.beneficiaries.reachedMen / d.beneficiaries.targetedMen
	)})</span></div>
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
