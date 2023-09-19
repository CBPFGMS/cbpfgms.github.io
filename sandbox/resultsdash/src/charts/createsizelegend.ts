import { select } from "d3-selection";
import { scalePoint, scaleSqrt } from "d3-scale";
import formatSIFloat from "../utils/formatsi";

function createSizeLegend({
	svgRef,
	maxValue,
	legendSvgWidth,
	legendSvgHeight,
	maxCircleRadius,
	minCircleRadius,
}: CreateSizeLegendParams): void {
	const svg = select(svgRef);
	const textPadding = 12;
	const sizeCirclesData =
		maxValue !== 0
			? [maxValue / 10, maxValue / 4, maxValue / 2, maxValue]
			: [];
	const posScale = scalePoint<string>()
		.domain(sizeCirclesData.map((_, i) => i.toString()))
		.range([0, legendSvgWidth])
		.padding(0.5);
	const radiusScale = scaleSqrt<number>()
		.domain([0, maxValue])
		.range([minCircleRadius, maxCircleRadius]);

	let sizeCircles = svg
		.selectAll<SVGCircleElement, number>("circle")
		.data<number>(sizeCirclesData);

	sizeCircles.exit().remove();

	sizeCircles = sizeCircles
		.enter()
		.append("circle")
		.merge(sizeCircles)
		.attr("r", d => radiusScale(d))
		.attr("cx", (_, i) => posScale(i.toString())!)
		.attr("cy", d => legendSvgHeight / 1.5 - radiusScale(d))
		.attr("fill", "none")
		.attr("stroke", "black")
		.attr("stroke-width", 0.5)
		.attr("stroke-opacity", 0.5);

	let sizeLabels = svg
		.selectAll<SVGTextElement, number>("text")
		.data<number>(sizeCirclesData);

	sizeLabels.exit().remove();

	sizeLabels = sizeLabels
		.enter()
		.append("text")
		.merge(sizeLabels)
		.attr("x", (_, i) => posScale(i.toString())!)
		.attr("y", legendSvgHeight / 1.5 + textPadding)
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "middle")
		.attr("font-size", "0.7rem")
		.text(
			(d, i) =>
				formatSIFloat(d) +
				(i === sizeCirclesData.length - 1 ? " (max)" : "")
		);
}

export default createSizeLegend;
