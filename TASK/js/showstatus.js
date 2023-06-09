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

	nodesGroup
		.filter(
			d => d.data.type !== "start" && currentSequence.includes(d.data.id)
		)
		.select("rect")
		.style("fill", previousStepsColorWithOpacity);

	linksGroup
		.filter(d => d.data.isCompleted)
		.select(`.${classPrefix}links`)
		.style("stroke-width", previousStepsStroke)
		.style("stroke", previousStepsColor);

	nodesGroup
		.filter(d => !currentSequence.includes(d.data.id))
		.style("opacity", d => (d.setOpacity = nextStepsOpacity));

	linksGroup
		.filter(d => !d.data.isCompleted)
		.style("opacity", d => (d.setOpacity = nextStepsOpacity));

	labelsText
		.filter(d => !d.data.isCompleted)
		.style("opacity", d => (d.setOpacity = nextStepsOpacity));

	labelsCircle
		.filter(d => !d.data.isCompleted)
		.style("stroke-opacity", d => (d.setOpacity = nextStepsOpacity));

	currentStatusNode.select("rect").style("fill", currentStatusFillColor);
	currentStatusNode.select("text").style("fill", currentStatusTextFillColor);

}

export { showStatus };
