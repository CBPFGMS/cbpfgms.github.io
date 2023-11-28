import { select } from "d3-selection";
import { interpolateRgb } from "d3-interpolate";
import colors from "../utils/colors";
import { scalePoint } from "d3-scale";
import { range } from "d3-array";
import { CreateColorLegendParams } from "../types";

function createColorLegend({
	svgRef,
	legendSvgWidth,
	legendSvgHeight,
}: CreateColorLegendParams): void {
	const svg = select(svgRef);
	const padding = 22;
	const textPadding = 12;
	const legendHeight = 20;

	const minValueColor = "#eee",
		maxMarkerColor = colors.contrastColorDarker,
		colorInterpolator = interpolateRgb(minValueColor, maxMarkerColor);

	const percentages = range(0, 1.01, 0.1).map(d => ~~(d * 100) + "%");

	const posScale = scalePoint<string>()
		.domain(percentages)
		.range([padding, legendSvgWidth - padding]);

	svg.selectAll<SVGImageElement, boolean>(".legendImage")
		.data<boolean>([true])
		.enter()
		.append("image")
		.attr("class", "legendImage")
		.attr("preserveAspectRatio", "none")
		.attr("height", legendHeight)
		.attr("y", legendSvgHeight / 2 - legendHeight)
		.attr("width", legendSvgWidth - padding * 2)
		.attr("x", padding)
		.attr("href", createCanvas(colorInterpolator));

	svg.selectAll<SVGLineElement, string>(".legendLine")
		.data<string>(percentages)
		.enter()
		.append("line")
		.attr("class", "legendLine")
		.attr("x1", d => posScale(d)!)
		.attr("x2", d => posScale(d)!)
		.attr("y1", legendSvgHeight / 2 - legendHeight)
		.attr("y2", legendSvgHeight / 2 + legendHeight / 2)
		.attr("stroke", "black")
		.attr("stroke-width", 0.5)
		.attr("stroke-opacity", 0.5);

	svg.selectAll<SVGTextElement, string>(".legendText")
		.data<string>(percentages)
		.enter()
		.append("text")
		.attr("class", "legendText")
		.attr("x", d => posScale(d)!)
		.attr("y", legendSvgHeight / 2 + textPadding)
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "hanging")
		.attr("font-size", "0.7rem")
		.text(d => d);
}

function createCanvas(colorInterpolator: (t: number) => string): string {
	const legendCanvas = document.createElement("canvas");
	const legendSlices = 512;
	const context = legendCanvas.getContext("2d");

	select(legendCanvas)
		.attr("width", legendSlices)
		.attr("height", 1)
		.style("imageRendering", "pixelated");

	if (context) {
		for (let i = 0; i < legendSlices; i++) {
			context.fillStyle = colorInterpolator(i / (legendSlices - 1));
			context.fillRect(i, 0, 1, 1);
		}
	}

	return legendCanvas.toDataURL();
}

export default createColorLegend;
