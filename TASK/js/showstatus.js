import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { constants, variables } from "./constants.js";

const {
	classPrefix,
	currentStatusFillColor,
	previousStepsColor,
	nextStepsColor
} = constants;

function showStatus({ nodesGroup, linksGroup, labelsGroup, currentStatus, dataNodes, dataLinks, currentStatusValueSpan }) {

	const currentStatusNode = nodesGroup.filter(d => d.data.id === currentStatus);

	currentStatusNode.select("rect").style("fill", currentStatusFillColor);

	currentStatusValueSpan.html(currentStatusNode.datum().data.text);

	const { previousNodes, previousLinks } = populatePreviousNodesAndLinks(dataLinks, currentStatus);

	nodesGroup.style("filter", d => d.data.id === currentStatus || d.data.type === "start" ? null : previousNodes.includes(d.data.id) ? `drop-shadow(0px 0px 4px ${previousStepsColor})` :
		`drop-shadow(0px 0px 4px ${nextStepsColor})`);
	linksGroup.select(`.${classPrefix}links`).style("filter", d => previousLinks.includes(d.data.id) ? `drop-shadow(0px 0px 4px ${previousStepsColor})` :
		`drop-shadow(0px 0px 4px ${nextStepsColor})`);

	// nodesGroup.filter(d => d.data.id !== currentStatus && d.data.type !== "start")
	// 	.select("rect")
	// 	.style("stroke", d => previousNodes.includes(d.data.id) ? previousStepsColor : nextStepsColor);
	// linksGroup.select(`.${classPrefix}links`).style("stroke", d => previousLinks.includes(d.data.id) ? previousStepsColor : nextStepsColor);

	return { previousNodes, previousLinks };

};

function populatePreviousNodesAndLinks(dataLinks, currentStatus) {
	const previousNodes = [],
		previousLinks = [];

	const incomingLinks = dataLinks.filter(d => d.data.target === currentStatus);
	incomingLinks.forEach(populateArrays);

	function populateArrays(link) {
		if (previousLinks.includes(link.data.id)) return;
		previousLinks.push(link.data.id);
		previousNodes.push(link.data.source);
		const nextLinks = dataLinks.filter(d => d.data.target === link.data.source);
		if (nextLinks.length) nextLinks.forEach(populateArrays);
	};

	return { previousNodes, previousLinks };
};

export { showStatus };