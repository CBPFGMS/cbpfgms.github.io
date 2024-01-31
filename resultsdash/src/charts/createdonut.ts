import { select, local } from "d3-selection";
import { arc, pie } from "d3-shape";
import { range, sum } from "d3-array";
import { transition } from "d3-transition";
import { format } from "d3-format";
import { interpolate, interpolateObject } from "d3-interpolate";
import { CreateDonutParams, DonutDatum, ArcObject } from "../types";

const localVariable = local<ArcObject>();

function createDonut({
	size,
	svgContainer,
	donutData,
	colorScale,
	reportYear,
}: CreateDonutParams) {
	const svg = select(svgContainer.current),
		padding = 12,
		thickness = 20,
		outerRadius = size / 2 - padding,
		innerRadius = outerRadius - thickness,
		rays = 10,
		duration = 750,
		arcGenerator = arc<(typeof pieData)[number]>()
			.outerRadius(outerRadius)
			.innerRadius(innerRadius),
		pieGenerator = pie<DonutDatum>()
			.sort(null)
			.value(d => d.value)
			.padAngle(0.02);

	const pieData = pieGenerator(donutData);

	const syncedTransition = transition().duration(duration);

	let centralGroup = svg
		.selectAll<SVGGElement, boolean>(".centralGroup")
		.data([true]);

	centralGroup = centralGroup
		.enter()
		.append("g")
		.attr("class", "centralGroup")
		.attr("transform", `translate(${size / 2},${size / 2})`)
		.merge(centralGroup);

	centralGroup
		.selectAll<SVGLineElement, number>(".rays")
		.data(range(rays))
		.enter()
		.append("line")
		.attr("class", "rays")
		.style("stroke", "#aaa")
		.style("stroke-width", 1)
		.attr(
			"x1",
			d =>
				Math.cos((d * 2 * Math.PI) / rays - Math.PI / 2) *
				(outerRadius + 1)
		)
		.attr(
			"y1",
			d =>
				Math.sin((d * 2 * Math.PI) / rays - Math.PI / 2) *
				(outerRadius + 1)
		)
		.attr(
			"x2",
			d =>
				Math.cos((d * 2 * Math.PI) / rays - Math.PI / 2) *
				(outerRadius + 4)
		)
		.attr(
			"y2",
			d =>
				Math.sin((d * 2 * Math.PI) / rays - Math.PI / 2) *
				(outerRadius + 4)
		);

	let donut = centralGroup
		.selectAll<SVGPathElement, (typeof pieData)[number]>(".donut")
		.data(pieData, d => d.data.type);

	donut.exit().remove();

	const donutEnter = donut
		.enter()
		.append("path")
		.attr("class", "donut")
		.attr("data-tooltip-id", "tooltip")
		.attr("data-tooltip-place", "top")
		.style("fill", d => colorScale(d.data.type))
		.attr("d", d => {
			const copiedObject = structuredClone(d);
			copiedObject.startAngle = 0;
			copiedObject.endAngle = 0;
			return arcGenerator(copiedObject);
		});

	donut = donutEnter.merge(donut);

	donut
		.attr(
			"data-tooltip-html",
			d =>
				(d.data.type === "selected"
					? "Reports approved in " + reportYear[0] + ":<br />$"
					: d.data.type === "allocated"
					? "Reports approved in other years:<br />$"
					: "Under Implementation:<br />$") + format(",.2f")(d.value)
		)
		.transition(syncedTransition)
		.attrTween("d", (d, i, n) => {
			const copiedObject = structuredClone(d);
			copiedObject.startAngle = localVariable.get(n[i])?.startAngle || 0;
			copiedObject.endAngle = localVariable.get(n[i])?.endAngle || 0;
			const interpolator = interpolateObject(copiedObject, d);
			return t => arcGenerator(interpolator(t)) as string;
		})
		.on("end", (d, i, n) => {
			localVariable.set(n[i], {
				startAngle: d.startAngle,
				endAngle: d.endAngle,
			});
		});

	const percentageValue =
		(donutData.find(d => d.type === "selected")?.value || 0) /
		sum(donutData, d => d.value);

	let percentage = centralGroup
		.selectAll<SVGTextElement, number>(".totalLabel")
		.data([percentageValue]);

	percentage = percentage
		.enter()
		.append("text")
		.attr("data-tooltip-id", "tooltip")
		.attr("data-tooltip-place", "top")
		.attr("class", "totalLabel")
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "central")
		.style("font-size", "12px")
		.style("font-weight", "bold")
		.style("fill", "#444")
		.merge(percentage);

	percentage
		.attr(
			"data-tooltip-html",
			d =>
				`Percentage of reports approved in ${
					reportYear[0]
				}<br />compared to reports approved in other years<br />and under implementation: <strong>${format(
					".2~%"
				)(d)}</strong>`
		)
		.transition(syncedTransition)
		.textTween((d, i, n) => {
			const interpolator = interpolate(
				parseFloat(n[i].textContent + "") / 100 || 0,
				d
			);
			return t => format(".1%")(interpolator(t));
		});
}

export default createDonut;
