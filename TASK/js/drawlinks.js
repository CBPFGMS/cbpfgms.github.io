import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { stylesList } from "./styleslist.js";
import { constants, variables } from "./constants.js";

const {
	classPrefix,
	lineGenerator
} = constants;

function drawLinks({ dataLinks, svg }) {

	const defs = svg.append("defs");

	Object.keys(stylesList.links.paths).forEach(type => {

		const marker = defs.append("marker")
			.attr("id", `arrow${type}`)
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

	const linksGroup = svg.selectAll(null)
		.data(dataLinks)
		.enter()
		.append("g")
		.attr("class", classPrefix + "linksGroup");

	const backLinks = linksGroup.append("path")
		.attr("d", d => lineGenerator(d.waypoints));

	const links = linksGroup.append("path")
		.attr("d", d => lineGenerator(d.waypoints))
		.attr("marker-end", d => `url(#arrow${d.data.type})`);

	//append textPaths
	backLinks.call(applyStyles, stylesList.links.backPaths);
	links.call(applyStyles, stylesList.links.paths);

};

function applyStyles(selection, styles) {
	selection.each((d, i, n) => {
		const thisSelection = d3.select(n[i]);
		Object.entries(styles[d.data.type]).forEach(([key, value]) => {
			thisSelection.style(key, value);
		});
	});
};


export { drawLinks };