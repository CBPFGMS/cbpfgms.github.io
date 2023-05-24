import { constants } from "./constants.js";

const {
	classPrefix,
	currentStatusFillColor,
	currentStatusTextFillColor,
	previousStepsColor,
	previousStepsStroke,
	nextStepsOpacity,
	previousStepsColorWithOpacity,
} = constants;

function showStatus({
	nodesGroup,
	linksGroup,
	labelsGroup,
	currentStatus,
	dataLinks,
	currentStatusValueSpan,
	currentSequence,
}) {
	const labelsText = labelsGroup.select("text"),
		labelsCircle = labelsGroup.select("circle");

	const currentStatusNode = nodesGroup.filter(
		d => d.data.id === currentStatus
	);

	currentStatusValueSpan.html(currentStatusNode.datum().data.text);

	// const { previousNodes, previousLinks } = populatePreviousNodesAndLinks(dataLinks, currentStatus);

	const currentLinks = dataLinks.reduce((acc, curr) => {
		if (curr.data.isCompleted) acc.push(curr.data.id);
		return acc;
	}, []);

	nodesGroup
		.filter(
			d => d.data.type !== "start" && currentSequence.includes(d.data.id)
		)
		.select("rect")
		.style("fill", previousStepsColorWithOpacity);

	linksGroup
		.filter(d => currentLinks.includes(d.data.id))
		.select(`.${classPrefix}links`)
		.style("stroke-width", previousStepsStroke)
		.style("stroke", previousStepsColor);

	nodesGroup
		.filter(d => !currentSequence.includes(d.data.id))
		.style("opacity", d => (d.setOpacity = nextStepsOpacity));

	linksGroup
		.filter(d => !currentLinks.includes(d.data.id))
		.style("opacity", d => (d.setOpacity = nextStepsOpacity));

	labelsText
		.filter(d => !currentLinks.includes(d.data.id))
		.style("opacity", d => (d.setOpacity = nextStepsOpacity));

	labelsCircle
		.filter(d => !currentLinks.includes(d.data.id))
		.style("stroke-opacity", d => (d.setOpacity = nextStepsOpacity));

	currentStatusNode.select("rect").style("fill", currentStatusFillColor);
	currentStatusNode.select("text").style("fill", currentStatusTextFillColor);

	return currentLinks;
}

export { showStatus };
