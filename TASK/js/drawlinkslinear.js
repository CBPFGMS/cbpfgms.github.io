import { constants } from "./constants.js";
import { stylesList } from "./styleslist.js";

/* global d3 */

const {
	classPrefix,
	previousStepsColor,
	previousStepsStroke,
	labelCircleRadius,
	labelCirclePadding,
	firstAlphabetLetter,
	additionalTasksColors,
} = constants;

/** @type {drawLinksLinear} */
function drawLinksLinear({
	dataLinksOriginal,
	nodesGroupLinear,
	currentLinearSequence,
	svgLinear,
	linearLegendDiv,
	tooltipDiv,
	width,
}) {
	/** @type {LinearExtended[]} */
	const linearSequence = structuredClone(currentLinearSequence.slice(0, -1));
	const subTasksData = linearSequence.filter(
		d => d.additionalTasks.length > 0
	);

	const defs = svgLinear.append("defs");

	Object.keys(stylesList.links.paths).forEach(type => {
		defs.append("marker")
			.attr("id", `arrowLinear${type}`)
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

	const linksGroupLinear = svgLinear
		.selectAll(null)
		.data(linearSequence)
		.enter()
		.append("g")
		.attr("class", classPrefix + "linksGroup")
		.each(d => {
			const originalLink = dataLinksOriginal.find(
				e => e.source === d.link.source && e.target === d.link.target
			);
			for (const key in originalLink) {
				d[key] = originalLink[key];
			}
		});

	const links = linksGroupLinear
		.append("line")
		.attr("class", classPrefix + "linksLinear")
		.attr("x1", width / 2)
		.attr("x2", width / 2)
		.attr("y1", (d, i) => {
			const sourceNode = nodesGroupLinear
				.filter(e => e.linearId === i)
				.datum();
			return sourceNode.rectMidY - sourceNode.rectHeight / 2;
		})
		.attr("y2", (d, i) => {
			const targetNode = nodesGroupLinear
				.filter(e => e.linearId === i + 1)
				.datum();
			return targetNode.rectMidY + targetNode.rectHeight / 2;
		})
		.attr("marker-end", "url(#arrowLinearprevious)");

	const labelsGroupLinear = svgLinear
		.selectAll(null)
		.data(structuredClone(linearSequence))
		.enter()
		.append("g")
		.attr("class", classPrefix + "labelsGroupLinear")
		.each(d => {
			const originalLink = dataLinksOriginal.find(
				e => e.source === d.link.source && e.target === d.link.target
			);
			for (const key in originalLink) {
				d[key] = originalLink[key];
			}
		})
		.attr("transform", (d, i) => {
			const sourceNode = nodesGroupLinear
				.filter(e => e.linearId === i)
				.datum();
			const targetNode = nodesGroupLinear
				.filter(e => e.linearId === i + 1)
				.datum();
			const x = width / 2;
			//marker height = 6
			const y =
				6 +
				(sourceNode.rectMidY -
					sourceNode.rectHeight / 2 +
					targetNode.rectMidY +
					targetNode.rectHeight / 2) /
					2;
			return `translate(${x},${y})`;
		});

	const labelCirclesLinear = labelsGroupLinear
		.append("circle")
		.attr("class", classPrefix + "labelsGroupLinearCircle")
		.attr("r", labelCircleRadius);

	const labelTextsLinear = labelsGroupLinear
		.append("text")
		.attr("class", classPrefix + "labelsGroupLinearText")
		.text(d => d.id);

	const subTasksGroup = svgLinear
		.selectAll(null)
		.data(subTasksData)
		.enter()
		.append("g")
		.attr("class", classPrefix + "subTasksGroup")
		.attr("transform", d => {
			const thisNode = nodesGroupLinear
				.filter(e => e.linearId === d.linearId)
				.datum();
			const x = width / 2 - thisNode.rectWidth / 2;
			const y = thisNode.rectMidY - thisNode.rectHeight / 2;
			return `translate(${x + labelCircleRadius},${y})`;
		});

	const subTasksSubGroup = subTasksGroup
		.selectAll(null)
		.data(d => d.additionalTasks)
		.enter()
		.append("g")
		.attr("class", classPrefix + "subTasksSubGroup")
		.attr(
			"transform",
			(_, i) =>
				`translate(${
					i * labelCircleRadius * 2 + i * labelCirclePadding
				},0)`
		);

	subTasksSubGroup
		.append("circle")
		.attr("class", classPrefix + "subTasksCircle")
		.style("fill", d => additionalTasksColors(d.TaskStatusName))
		.attr("r", labelCircleRadius);

	subTasksSubGroup
		.append("text")
		.attr("class", classPrefix + "subTasksText")
		.text((_, i) => String.fromCharCode(firstAlphabetLetter + i));

	subTasksSubGroup.on("mouseover", showTooltip).on("mouseout", hideTooltip);

	linearLegendDiv.append("div").html("Additional tasks");

	const linearLegendRow = linearLegendDiv
		.selectAll(null)
		.data(additionalTasksColors.domain())
		.enter()
		.append("div")
		.attr("class", classPrefix + "linearLegendRow");

	linearLegendRow
		.append("div")
		.attr("class", classPrefix + "legendCircle")
		.style("width", labelCircleRadius * 2 + "px")
		.style("height", labelCircleRadius * 2 + "px")
		.style("background-color", d => additionalTasksColors(d));

	linearLegendRow
		.append("div")
		.attr("class", classPrefix + "legendText")
		.text(d => d);

	links.call(applyStyles, stylesList.links.paths);
	labelCirclesLinear.call(applyStyles, stylesList.links.circles);
	labelTextsLinear.call(applyStyles, stylesList.links.texts);

	links
		.style("stroke-width", previousStepsStroke)
		.style("stroke", previousStepsColor);

	return { linksGroupLinear, labelsGroupLinear, subTasksSubGroup };

	function showTooltip(event, d) {
		tooltipDiv.style("display", "block");
		tooltipDiv.append("div").html("Task: " + d.TaskName);
		tooltipDiv.append("div").html("Status: " + d.TaskStatusName);
		const thisOffset = event.currentTarget.getBoundingClientRect();
		const tooltipOffset = tooltipDiv.node().getBoundingClientRect();
		const containerOffset = tooltipDiv
			.node()
			// @ts-ignore
			.parentNode.getBoundingClientRect();
		tooltipDiv
			.style(
				"left",
				thisOffset.left -
					tooltipOffset.width -
					containerOffset.left -
					10 +
					"px"
			)
			.style("top", thisOffset.top - containerOffset.top + "px");
	}

	function hideTooltip() {
		tooltipDiv.html(null).style("display", "none");
	}
}

function applyStyles(selection, styles) {
	selection.each((d, i, n) => {
		const thisSelection = d3.select(n[i]);
		Object.entries(styles[d.type]).forEach(([key, value]) => {
			thisSelection.style(key, value);
		});
	});
}

export { drawLinksLinear };
