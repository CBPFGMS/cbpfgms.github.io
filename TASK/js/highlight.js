import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { constants, variables } from "./constants.js";

const {
	classPrefix,
	fadeOpacityNodes,
	fadeOpacityLinks,
	fadeOpacityLinkLabels,
	fadeOpacityLinkList
} = constants;

function highlight({ nodesGroup, linksGroup, labelsGroup, linksList }) {

	nodesGroup.on("mouseenter", mouseoverNodesGroup)
		.on("mouseleave", mouseout);

	linksGroup.on("mouseenter", mouseoverLinks)
		.on("mouseleave", mouseout);

	labelsGroup.on("mouseenter", mouseoverLinks)
		.on("mouseleave", mouseout);

	linksList.on("mouseenter", mouseoverLinksList)
		.on("mouseleave", mouseout);

	function mouseoverNodesGroup(event, d) {
		const linkedNodes = [];
		linksGroup.style("opacity", e => {
			if (e.data.source === d.data.id) linkedNodes.push(e.data.target);
			if (e.data.target === d.data.id) linkedNodes.push(e.data.source);
			return e.data.source === d.data.id || e.data.target === d.data.id ? 1 : fadeOpacityLinks;
		});
		labelsGroup.style("opacity", e => e.data.source === d.data.id || e.data.target === d.data.id ? 1 : fadeOpacityLinkLabels);
		linksList.style("opacity", e => e.source === d.data.id || e.target === d.data.id ? 1 : fadeOpacityLinkLabels);
		nodesGroup.style("opacity", e => e.data.id === d.data.id || linkedNodes.includes(e.data.id) ? 1 : fadeOpacityNodes);
	};

	function mouseoverLinks(event, d) {
		linksGroup.style("opacity", e => e.data.id === d.data.id ? 1 : fadeOpacityLinks);
		labelsGroup.style("opacity", e => e.data.id === d.data.id ? 1 : fadeOpacityLinks);
		linksList.style("opacity", e => e.id === d.data.id ? 1 : fadeOpacityLinks);
		nodesGroup.style("opacity", e => e.data.id === d.data.source || e.data.id === d.data.target ? 1 : fadeOpacityNodes);
	};

	function mouseoverLinksList(event, d) {
		linksList.style("opacity", e => e.id === d.id ? 1 : fadeOpacityLinks);
		linksGroup.style("opacity", e => e.data.id === d.id ? 1 : fadeOpacityLinks);
		labelsGroup.style("opacity", e => e.data.id === d.id ? 1 : fadeOpacityLinks);
		nodesGroup.style("opacity", e => e.data.id === d.source || e.data.id === d.target ? 1 : fadeOpacityNodes);
	};

	function mouseout() {
		nodesGroup.style("opacity", 1);
		linksGroup.style("opacity", 1);
		labelsGroup.style("opacity", 1);
		linksList.style("opacity", 1);
	};

};

export { highlight };