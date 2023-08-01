import { constants } from "./constants.js";
import { stylesList } from "./styleslist.js";

/* global d3 */

const {
	classPrefix,
	previousStepsColor,
	previousStepsStroke,
	labelCircleRadius,
} = constants;

/** @type {drawLinksLinear} */
function drawLinksLinear({
	dataLinksOriginal,
	nodesGroupLinear,
	currentLinearSequence,
	svgLinear,
	width,
}) {
	/** @type {LinearExtended[]} */
	const linearSequence = structuredClone(currentLinearSequence.slice(0, -1));

	const defs = svgLinear.append("defs");

	Object.keys(stylesList.links.paths).forEach(type => {
		defs.append("marker")
			.attr("id", `arrowLinear${type}`)
			.attr("viewBox", "0 -4 10 10")
			.attr("refX", 9)
			.attr("refY", 0)
			.attr("markerWidth", 6)
			.attr("markerHeight", 6)
			.attr("orient", "auto")
			.append("path")
			.attr("d", "M0,-4L10,0L0,4")
			.attr("opacity", 1)
			.attr("fill", stylesList.links.paths[type].stroke)
			.attr("stroke", "none")
			.attr("class", "arrowHead");
	});

	const linksGroup = svgLinear
		.selectAll(null)
		.data(linearSequence)
		.enter()
		.append("g")
		.attr("class", classPrefix + "linksGroup")
		.each(d => {
			const originalLink = dataLinksOriginal.find(
				e => e.source === d.link.source && e.target === d.link.target
			);
			for (const key in originalLink) {
				d[key] = originalLink[key];
			}
		});

	const links = linksGroup
		.append("line")
		.attr("class", classPrefix + "linksLinear")
		.attr("x1", width / 2)
		.attr("x2", width / 2)
		.attr("y1", (d, i) => {
			const sourceNode = nodesGroupLinear
				.filter(e => e.linearId === i)
				.datum();
			return sourceNode.rectMidY - sourceNode.rectHeight / 2;
		})
		.attr("y2", (d, i) => {
			const targetNode = nodesGroupLinear
				.filter(e => e.linearId === i + 1)
				.datum();
			return targetNode.rectMidY + targetNode.rectHeight / 2;
		})
		.attr("marker-end", "url(#arrowLinearprevious)");

	const labelsGroupLinear = svgLinear
		.selectAll(null)
		.data(structuredClone(linearSequence))
		.enter()
		.append("g")
		.attr("class", classPrefix + "labelsGroupLinear")
		.each(d => {
			const originalLink = dataLinksOriginal.find(
				e => e.source === d.link.source && e.target === d.link.target
			);
			for (const key in originalLink) {
				d[key] = originalLink[key];
			}
		})
		.attr("transform", (d, i) => {
			const sourceNode = nodesGroupLinear
				.filter(e => e.linearId === i)
				.datum();
			const targetNode = nodesGroupLinear
				.filter(e => e.linearId === i + 1)
				.datum();
			const x = width / 2;
			//marker height = 6
			const y =
				6 +
				(sourceNode.rectMidY -
					sourceNode.rectHeight / 2 +
					targetNode.rectMidY +
					targetNode.rectHeight / 2) /
					2;
			return `translate(${x},${y})`;
		});

	const labelCirclesLinear = labelsGroupLinear
		.append("circle")
		.attr("class", classPrefix + "labelsGroupLinearCircle")
		.attr("r", labelCircleRadius);

	const labelTextsLinear = labelsGroupLinear
		.append("text")
		.attr("class", classPrefix + "labelsGroupLinearText")
		.text(d => d.id);

	links.call(applyStyles, stylesList.links.paths);
	labelCirclesLinear.call(applyStyles, stylesList.links.circles);
	labelTextsLinear.call(applyStyles, stylesList.links.texts);

	links
		.style("stroke-width", previousStepsStroke)
		.style("stroke", previousStepsColor);
}

function applyStyles(selection, styles) {
	selection.each((d, i, n) => {
		const thisSelection = d3.select(n[i]);
		Object.entries(styles[d.type]).forEach(([key, value]) => {
			thisSelection.style(key, value);
		});
	});
}

export { drawLinksLinear };
