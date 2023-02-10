import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { stylesList } from "./styleslist.js";
import { constants, variables } from "./constants.js";

const {
	classPrefix,
	nodesTextSpacing
} = constants;

function drawNodes({ dataNodes, svg }) {

	const nodesGroup = svg.selectAll(null)
		.data(dataNodes)
		.enter()
		.append("g")
		.attr("transform", d => `translate(${d.x},${d.y})`);

	const rectangles = nodesGroup.append("rect")
		.attr("x", d => -(d.rectWidth / 2))
		.attr("y", d => -(d.rectHeight / 2))
		.attr("width", d => d.rectWidth)
		.attr("height", d => d.rectHeight);

	const texts = nodesGroup.append("text")
		.attr("class", classPrefix + "nodeText")
		.attr("x", 0)
		.attr("y", d => d.nodeText.length > 1 ? -nodesTextSpacing : 0)
		.text(d => d.nodeText[0]);

	texts.each((d, i, n) => {
		if (d.nodeText.length > 1) {
			d3.select(n[i]).append("tspan")
				.attr("x", 0)
				.attr("y", nodesTextSpacing)
				.text(d.nodeText[1]);
		};
	});

	rectangles.call(applyStyles, stylesList.nodes.rects);
	texts.call(applyStyles, stylesList.nodes.texts);

};

function applyStyles(selection, styles) {
	selection.each((d, i, n) => {
		const thisSelection = d3.select(n[i]);
		Object.entries(styles[d.data.type]).forEach(([key, value]) => {
			thisSelection.style(key, value);
		});
	});
};


export { drawNodes };