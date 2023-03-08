import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { constants, variables } from "./constants.js";

const {
	classPrefix,
	currentStatusFillColor,
	previousStepsColor,
	nextStepsColor,
	previousStepsStroke,
	nextStepsOpacity
} = constants;

function showStatus({ nodesGroup, linksGroup, labelsGroup, currentStatus, dataNodes, dataLinks, currentStatusValueSpan, currentSequence }) {

	const labelsText = labelsGroup.select("text"),
		labelsCircle = labelsGroup.select("circle");

	const currentStatusNode = nodesGroup.filter(d => d.data.id === currentStatus);

	currentStatusNode.select("rect").style("fill", currentStatusFillColor);

	currentStatusValueSpan.html(currentStatusNode.datum().data.text);

	// const { previousNodes, previousLinks } = populatePreviousNodesAndLinks(dataLinks, currentStatus);

	const currentLinks = populatePastLinks(currentSequence, dataLinks);

	// nodesGroup.style("filter", d => d.data.id === currentStatus || d.data.type === "start" ? null : previousNodes.includes(d.data.id) ? `drop-shadow(0px 0px 4px ${previousStepsColor})` :
	// 	`drop-shadow(0px 0px 4px ${nextStepsColor})`);
	// linksGroup.select(`.${classPrefix}links`).style("filter", d => previousLinks.includes(d.data.id) ? `drop-shadow(0px 0px 4px ${previousStepsColor})` :
	// 	`drop-shadow(0px 0px 4px ${nextStepsColor})`);

	nodesGroup.filter(d => d.data.type !== "start" && currentSequence.includes(d.data.id))
		.select("rect")
		.style("filter", `drop-shadow(0px 0px 4px ${previousStepsColor})`)
		.style("stroke", previousStepsColor);
	linksGroup.filter(d => currentLinks.includes(d.data.id))
		.select(`.${classPrefix}links`)
		.style("stroke-width", previousStepsStroke)
		.style("stroke", previousStepsColor);

	nodesGroup.filter(d => !currentSequence.includes(d.data.id))
		.style("opacity", d => d.setOpacity = nextStepsOpacity);

	linksGroup.filter(d => !currentLinks.includes(d.data.id))
		.style("opacity", d => d.setOpacity = nextStepsOpacity);

	labelsText.filter(d => !currentLinks.includes(d.data.id))
		.style("opacity", d => d.setOpacity = nextStepsOpacity);

	labelsCircle.filter(d => !currentLinks.includes(d.data.id))
		.style("stroke-opacity", d => d.setOpacity = nextStepsOpacity);

	return currentLinks;

};

function populatePastLinks(currentSequence, dataLinks) {
	const linksArray = dataLinks.reduce((acc, curr) => {
		if (currentSequence.includes(curr.data.source) && currentSequence.includes(curr.data.target)) acc.push(curr.data.id);
		return acc;
	}, []);
	return linksArray;
};

// function populatePreviousNodesAndLinks(dataLinks, currentStatus) {
// 	const previousNodes = [],
// 		previousLinks = [];

// 	const incomingLinks = dataLinks.filter(d => d.data.target === currentStatus);
// 	incomingLinks.forEach(populateArrays);

// 	function populateArrays(link) {
// 		if (previousLinks.includes(link.data.id)) return;
// 		previousLinks.push(link.data.id);
// 		previousNodes.push(link.data.source);
// 		const nextLinks = dataLinks.filter(d => d.data.target === link.data.source);
// 		if (nextLinks.length) nextLinks.forEach(populateArrays);
// 	};

// 	return { previousNodes, previousLinks };
// };

export { showStatus };