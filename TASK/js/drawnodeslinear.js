import { constants, variables } from "./constants.js";
import { stylesList } from "./styleslist.js";

/* global d3 */

const {
	yScaleLinear,
	paddingLinear,
	classPrefix,
	nodesTextPaddingHorizontal,
	nodesTextPaddingVertical,
	currentStatusFillColor,
	currentStatusTextFillColor,
	previousStepsColorWithOpacity,
} = constants;

/** @type {drawNodesLinear} */
function drawNodesLinear({
	dataNodesOriginal,
	currentLinearSequence,
	svgLinear,
	width,
	currentStatus,
}) {
	yScaleLinear
		.domain(currentLinearSequence.map(e => e.linearId.toString()))
		.range([variables.heightLinear - paddingLinear[2], paddingLinear[0]])
		.padding(1);

	/** @type {LinearExtended[]} */
	const linearData = structuredClone(currentLinearSequence);

	const nodesGroupLinear = svgLinear
		.selectAll(null)
		.data(linearData)
		.enter()
		.append("g")
		.attr(
			"transform",
			d =>
				`translate(${width / 2},${yScaleLinear(d.linearId.toString())})`
		)
		.each(d => {
			const originalNode = dataNodesOriginal.find(
				e => e.id === d.thisNode
			);
			for (const key in originalNode) {
				d[key] = originalNode[key];
			}
		});

	const texts = nodesGroupLinear
		.append("text")
		.attr("class", classPrefix + "nodeTextLinear")
		.attr("dy", d => (d.additionalTasks.length > 0 ? "0.5em" : null))
		.text(d => dataNodesOriginal.find(e => e.id === d.thisNode).text);

	nodesGroupLinear.each((d, i, n) => {
		const hasAdditionalTasks = d.additionalTasks.length > 0;
		// @ts-ignore
		const { width, height } = n[i].firstChild.getBBox();
		d.rectWidth =
			width + nodesTextPaddingHorizontal * (hasAdditionalTasks ? 3 : 2);
		d.rectHeight =
			height + nodesTextPaddingVertical * (hasAdditionalTasks ? 3 : 2);
		d.rectMidY = yScaleLinear(d.linearId.toString());
	});

	const rectangles = nodesGroupLinear
		.insert("rect", "text")
		.attr("x", d => -(d.rectWidth / 2))
		.attr("y", d => -(d.rectHeight / 2))
		.attr("width", d => d.rectWidth)
		.attr("height", d => d.rectHeight);

	rectangles.call(applyStyles, stylesList.nodes.rects);
	texts.call(applyStyles, stylesList.nodes.texts);

	const currentStatusNode = nodesGroupLinear.filter(
		d => d.id === currentStatus
	);

	nodesGroupLinear
		.filter(d => d.type !== "start")
		.select("rect")
		.style("fill", previousStepsColorWithOpacity);

	currentStatusNode.select("rect").style("fill", currentStatusFillColor);
	currentStatusNode.select("text").style("fill", currentStatusTextFillColor);

	return nodesGroupLinear;
}

function applyStyles(selection, styles) {
	selection.each((d, i, n) => {
		const thisSelection = d3.select(n[i]);
		Object.entries(styles[d.type]).forEach(([key, value]) => {
			thisSelection.style(key, value);
		});
	});
}

export { drawNodesLinear };
