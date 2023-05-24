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
	linksList,
	flowChartCurrentStatusDiv,
	currentStatus,
}) {
	const labelsText = labelsGroup.select("text"),
		labelsCircle = labelsGroup.select("circle");

	const currentStatusNode = nodesGroup.filter(
		d => d.data.id === currentStatus
	);

	nodesGroup.on("mouseenter", mouseoverNodesGroup).on("mouseleave", mouseout);
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
}

export { highlight };
