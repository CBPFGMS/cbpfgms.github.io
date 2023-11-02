import { select, local } from "d3-selection";
import { arc } from "d3-shape";
import { range } from "d3-array";
import { transition } from "d3-transition";
import { format } from "d3-format";
import { interpolate, interpolateObject } from "d3-interpolate";
import colors from "../utils/colors";

const localVariable = local<number>();

function createDonut({
	size,
	svgContainer,
	total,
	allocatedSelected,
}: CreateDonutParams) {
	const svg = select(svgContainer.current),
		padding = 28,
		thickness = 20,
		outerRadius = size / 2 - padding,
		innerRadius = outerRadius - thickness,
		rays = 10,
		labels = 5,
		duration = 750,
		arcGenerator = arc<{ startAngle: number; endAngle: number }>()
			.outerRadius(outerRadius)
			.innerRadius(innerRadius);

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
		.selectAll<SVGPathElement, boolean>(".backgroundDonut")
		.data([true])
		.enter()
		.append("path")
		.attr("class", "backgroundDonut")
		.style("fill", "#ccc")
		.attr("d", arcGenerator({ startAngle: 0, endAngle: 2 * Math.PI }));

	centralGroup
		.selectAll<SVGLineElement, number>(".rays")
		.data(range(rays))
		.enter()
		.append("line")
		.attr("class", "rays")
		.style("stroke", "#aaa")
		.style("stroke-width", 1)
		.style("stroke-dasharray", "2, 2")
		.attr(
			"x1",
			d =>
				Math.cos((d * 2 * Math.PI) / rays - Math.PI / 2) *
				(innerRadius - 3)
		)
		.attr(
			"y1",
			d =>
				Math.sin((d * 2 * Math.PI) / rays - Math.PI / 2) *
				(innerRadius - 3)
		)
		.attr(
			"x2",
			d =>
				Math.cos((d * 2 * Math.PI) / rays - Math.PI / 2) *
				(outerRadius + 3)
		)
		.attr(
			"y2",
			d =>
				Math.sin((d * 2 * Math.PI) / rays - Math.PI / 2) *
				(outerRadius + 3)
		);

	centralGroup
		.selectAll<SVGTextElement, number>(".raysLabels")
		.data(range(labels))
		.enter()
		.append("text")
		.attr("class", "raysLabels")
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "central")
		.style("font-size", "10px")
		.style("fill", "#666")
		.attr(
			"x",
			d =>
				Math.cos((d * 2 * Math.PI) / labels - Math.PI / 2) *
				(outerRadius + 18)
		)
		.attr(
			"y",
			d =>
				Math.sin((d * 2 * Math.PI) / labels - Math.PI / 2) *
				(outerRadius + 12)
		)
		.text(d => (d === 0 ? "100%" : `${d * 20}%`));

	let approvedDonut = centralGroup
		.selectAll<SVGPathElement, ApprovedAndUnder>(".approvedDonut")
		.data([total]);

	const approvedDonutEnter = approvedDonut
		.enter()
		.append("path")
		.attr("class", "approvedDonut")
		.attr("data-tooltip-id", "tooltip")
		.attr("data-tooltip-place", "top")
		.style("stroke", "#fff")
		.style("stroke-width", 1)
		.style("fill", colors.unColorLighter)
		.attr("d", arcGenerator({ startAngle: 0, endAngle: 0 }));

	approvedDonut = approvedDonutEnter.merge(approvedDonut);

	approvedDonut
		.attr(
			"data-tooltip-html",
			d =>
				"Total approved in all report years:<br />$" +
				format(",.2f")(d.approved)
		)
		.transition(syncedTransition)
		.attrTween("d", (d, i, n) => {
			const interpolator = interpolateObject(
				{ startAngle: 0, endAngle: localVariable.get(n[i]) || 0 },
				{
					startAngle: 0,
					endAngle:
						(d.approved / (d.approved + d.underApproval)) *
						2 *
						Math.PI,
				}
			);
			return t =>
				arcGenerator(interpolator(t)) ||
				(arcGenerator({ startAngle: 0, endAngle: 0 }) as string);
		})
		.on("end", (d, i, n) => {
			localVariable.set(
				n[i],
				(d.approved / (d.approved + d.underApproval)) * 2 * Math.PI
			);
		});

	let allocatedDonut = centralGroup
		.selectAll<SVGPathElement, number>(".allocatedDonut")
		.data([allocatedSelected]);

	const allocatedDonutEnter = allocatedDonut
		.enter()
		.append("path")
		.attr("class", "allocatedDonut")
		.attr("data-tooltip-id", "tooltip")
		.attr("data-tooltip-place", "top")
		.style("stroke", "#fff")
		.style("stroke-width", 1)
		.style("fill", colors.contrastColor)
		.attr("d", arcGenerator({ startAngle: 0, endAngle: 0 }));

	allocatedDonut = allocatedDonutEnter.merge(allocatedDonut);

	allocatedDonut
		.attr("data-tooltip-html", d => "Total for the selected year(s)<br />in the selected report year:<br />$" + format(",.2f")(d))
		.transition(syncedTransition)
		.attrTween("d", (d, i, n) => {
			const interpolator = interpolateObject(
				{ startAngle: 0, endAngle: localVariable.get(n[i]) || 0 },
				{
					startAngle: 0,
					endAngle:
						(d / (total.approved + total.underApproval)) *
						2 *
						Math.PI,
				}
			);
			return t =>
				arcGenerator(interpolator(t)) ||
				(arcGenerator({ startAngle: 0, endAngle: 0 }) as string);
		})
		.on("end", (d, i, n) => {
			localVariable.set(
				n[i],
				(d / (total.approved + total.underApproval)) * 2 * Math.PI
			);
		});

	let percentage = centralGroup
		.selectAll<SVGTextElement, number>(".totalLabel")
		.data([allocatedSelected / (total.approved + total.underApproval)]);

	percentage = percentage
		.enter()
		.append("text")
		.attr("class", "totalLabel")
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "central")
		.style("font-size", "12px")
		.style("font-weight", "bold")
		.style("fill", "#444")
		.merge(percentage);

	percentage.transition(syncedTransition).textTween((d, i, n) => {
		const interpolator = interpolate(
			parseFloat(n[i].textContent + "") / 100 || 0,
			d
		);
		return t => format(".1%")(interpolator(t));
	});
}

export default createDonut;
