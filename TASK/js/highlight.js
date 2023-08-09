import { constants } from "./constants.js";

const {
	fadeOpacityNodes,
	fadeOpacityLinks,
	fadeOpacityLinkLabels,
	fadeOpacityLinkList,
	fadeOpacityLinkListBase,
} = constants;

function highlight({
	nodesGroup,
	linksGroup,
	labelsGroup,
	nodesGroupLinear,
	linksGroupLinear,
	labelsGroupLinear,
	subTasksSubGroup,
	linksList,
	flowChartCurrentStatusDiv,
	currentStatus,
}) {
	const labelsText = labelsGroup.select("text"),
		labelsCircle = labelsGroup.select("circle"),
		labelsTextLinear = labelsGroupLinear.select("text"),
		labelsCircleLinear = labelsGroupLinear.select("circle"),
		subTasksLabelsText = subTasksSubGroup.select("text"),
		subTasksLabelsCircle = subTasksSubGroup.select("circle");

	const currentStatusNode = nodesGroup.filter(
		d => d.data.id === currentStatus
	);

	nodesGroup.on("mouseenter", mouseoverNodesGroup).on("mouseleave", mouseout);
	nodesGroupLinear
		.on("mouseenter", mouseoverNodesGroupLinear)
		.on("mouseleave", mouseoutLinear);
	linksGroup.on("mouseenter", mouseoverLinks).on("mouseleave", mouseout);
	labelsGroup.on("mouseenter", mouseoverLinks).on("mouseleave", mouseout);
	linksList.on("mouseenter", mouseoverLinksList).on("mouseleave", mouseout);
	flowChartCurrentStatusDiv
		.on("mouseenter", () => {
			mouseoverNodesGroup(null, currentStatusNode.datum());
		})
		.on("mouseleave", mouseout);

	function mouseoverNodesGroup(event, d) {
		const linkedNodes = [];
		linksGroup.style("opacity", e => {
			if (e.data.source === d.data.id) linkedNodes.push(e.data.target);
			if (e.data.target === d.data.id) linkedNodes.push(e.data.source);
			return e.data.source === d.data.id || e.data.target === d.data.id
				? 1
				: fadeOpacityLinks;
		});
		labelsText.style("opacity", e =>
			e.data.source === d.data.id || e.data.target === d.data.id
				? 1
				: fadeOpacityLinkLabels
		);
		labelsCircle.style("stroke-opacity", e =>
			e.data.source === d.data.id || e.data.target === d.data.id
				? 1
				: fadeOpacityLinkLabels
		);
		labelsCircle.style("filter", e =>
			e.data.source === d.data.id || e.data.target === d.data.id
				? null
				: "contrast(0.9)"
		);
		linksList.style("opacity", e =>
			e.source === d.data.id || e.target === d.data.id
				? 1
				: fadeOpacityLinkListBase
		);
		nodesGroup.style("opacity", e =>
			e.data.id === d.data.id || linkedNodes.includes(e.data.id)
				? 1
				: fadeOpacityNodes
		);
	}

	function mouseoverNodesGroupLinear(event, d) {
		linksGroupLinear.style("opacity", e =>
			e.linearId === d.linearId || e.linearId === d.linearId - 1
				? 1
				: fadeOpacityNodes
		);
		nodesGroupLinear.style("opacity", e =>
			e.linearId === d.linearId ||
			e.linearId === d.linearId + 1 ||
			e.linearId === d.linearId - 1
				? 1
				: fadeOpacityNodes
		);
		linksList.style("opacity", e =>
			e.source === d.thisNode || e.target === d.thisNode
				? 1
				: fadeOpacityLinkListBase
		);
		labelsTextLinear.style("opacity", e =>
			e.linearId === d.linearId || e.linearId === d.linearId - 1
				? 1
				: fadeOpacityLinkLabels
		);
		labelsCircleLinear.style("stroke-opacity", e =>
			e.linearId === d.linearId || e.linearId === d.linearId - 1
				? 1
				: fadeOpacityLinkLabels
		);
		labelsCircleLinear.style("filter", e =>
			e.linearId === d.linearId || e.linearId === d.linearId - 1
				? null
				: "contrast(0.9)"
		);
		subTasksLabelsText.style("opacity", fadeOpacityLinkLabels);
		subTasksLabelsCircle.style("stroke-opacity", fadeOpacityLinkLabels);
	}

	function mouseoverLinks(event, d) {
		linksGroup.style("opacity", e =>
			e.data.id === d.data.id ? 1 : fadeOpacityLinks
		);
		labelsText.style("opacity", e =>
			e.data.id === d.data.id ? 1 : fadeOpacityLinks
		);
		labelsCircle.style("stroke-opacity", e =>
			e.data.id === d.data.id ? 1 : fadeOpacityLinks
		);
		labelsCircle.style("filter", e =>
			e.data.id === d.data.id ? null : "contrast(0.9)"
		);
		linksList.style("opacity", e =>
			e.id === d.data.id ? 1 : fadeOpacityLinkListBase
		);
		nodesGroup.style("opacity", e =>
			e.data.id === d.data.source || e.data.id === d.data.target
				? 1
				: fadeOpacityNodes
		);
	}

	function mouseoverLinksList(event, d) {
		linksList.style("opacity", e =>
			e.id === d.id ? 1 : fadeOpacityLinkList
		);
		linksGroup.style("opacity", e =>
			e.data.id === d.id ? 1 : fadeOpacityLinks
		);
		labelsText.style("opacity", e =>
			e.data.id === d.id ? 1 : fadeOpacityLinks
		);
		labelsCircle.style("stroke-opacity", e =>
			e.data.id === d.id ? 1 : fadeOpacityLinks
		);
		labelsCircle.style("filter", e =>
			e.data.id === d.id ? null : "contrast(0.9)"
		);
		nodesGroup.style("opacity", e =>
			e.data.id === d.source || e.data.id === d.target
				? 1
				: fadeOpacityNodes
		);
	}

	function mouseout() {
		nodesGroup.style("opacity", d => d.setOpacity);
		linksGroup.style("opacity", d => d.setOpacity);
		labelsText.style("opacity", d => d.setOpacity);
		labelsCircle.style("stroke-opacity", d => d.setOpacity);
		labelsCircle.style("filter", null);
		linksList.style("opacity", d => d.setOpacity);
	}

	function mouseoutLinear() {
		nodesGroupLinear.style("opacity", 1);
		linksGroupLinear.style("opacity", 1);
		labelsTextLinear.style("opacity", 1);
		labelsCircleLinear.style("stroke-opacity", 1);
		labelsCircleLinear.style("filter", null);
		subTasksLabelsText.style("opacity", 1);
		subTasksLabelsCircle.style("stroke-opacity", 1);
		subTasksLabelsCircle.style("filter", null);
		linksList.style("opacity", d => d.setOpacity);
	}
}

export { highlight };
