import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { flowNodesGenerator } from "./flownodesgenerator.js";
import { flowLinksGenerator } from "./flowlinksgenerator.js";
import { stylesList } from "./styleslist.js";
import { constants, variables } from "./constants.js";
import { drawNodes } from "./drawnodes.js";
import { drawLinks } from "./drawlinks.js";
import { drawLinksList } from "./drawlinkslist.js";
import { highlight } from "./highlight.js";
import { showStatus } from "./showstatus.js";

const {
	classPrefix,
	chartContainer,
	defaultNumberOfColumns,
	yScale,
	currentStatusFillColor,
	defaultHoverText
} = constants;

const numberOfColumnsDataset = +chartContainer.node().dataset.columns;

const flowChartDivContainer = chartContainer.append("div").attr("class", classPrefix + "flowChartDivContainer"),
	sideDiv = chartContainer.append("div").attr("class", classPrefix + "sideDiv"),
	flowChartTopDiv = flowChartDivContainer.append("div").attr("class", classPrefix + "flowChartTopDiv"),
	flowChartCurrentStatusDiv = flowChartTopDiv.append("div").attr("class", classPrefix + "flowChartCurrentStatusDiv"),
	flowChartHoveredDiv = flowChartTopDiv.append("div").attr("class", classPrefix + "flowChartHoveredDiv"),
	flowChartHoveredSpan = flowChartHoveredDiv.append("span").attr("class", classPrefix + "flowChartHoveredSpan").html(defaultHoverText),
	currentStatusBullet = flowChartCurrentStatusDiv.append("span").html("&#11045 "),
	currentStatusText = flowChartCurrentStatusDiv.append("span").html("Allocation current status: "),
	currentStatusValueSpan = flowChartCurrentStatusDiv.append("span").attr("class", classPrefix + "currentStatusValueSpan"),
	flowChartDiv = flowChartDivContainer.append("div").attr("class", classPrefix + "flowChartDiv"),
	sideDivTitle = sideDiv.append("div").attr("class", classPrefix + "sideDivTitle"),
	sideDivContainer = sideDiv.append("div").attr("class", classPrefix + "sideDivContainer"),
	details = sideDivTitle.append("div").append("details");

details.append("summary")
	.append("span")
	.html("Links description");

details.append("p")
	.html("This is a list of the links. Hover over the links below or the numbers on the left to highlight the nodes.");

const flowChartDivSize = flowChartDiv.node().getBoundingClientRect();

const { width } = flowChartDivSize;

const svg = flowChartDiv.append("svg")
	.attr("width", width);

d3.json("./data/data.json").then(createFlowChart);

function createFlowChart(data) {

	const { nodes: dataNodesOriginal, links: dataLinksOriginal, currentStatus } = data;

	const numberOfColumns = data.numberOfColumns ?? numberOfColumnsDataset ?? defaultNumberOfColumns;

	const dataNodes = flowNodesGenerator({ dataNodesOriginal, width, numberOfColumns, svg });

	const dataLinks = flowLinksGenerator({ dataLinksOriginal, dataNodes });

	svg.attr("height", variables.height);

	const { linksGroup, labelsGroup } = drawLinks({ dataLinks, svg });

	const nodesGroup = drawNodes({ dataNodes, svg });

	flowChartTopDiv.style("margin-left", yScale(0) + "px")
		.style("margin-right", yScale(0) + "px");

	currentStatusBullet.style("color", d3.color(currentStatusFillColor).darker(0.5));

	currentStatusValueSpan.style("text-decoration", "underline")
		.style("text-decoration-thickness", "3px")
		.style("text-underline-offset", "0.3em")
		.style("text-decoration-color", currentStatusFillColor);

	const { previousNodes, previousLinks } = showStatus({ nodesGroup, linksGroup, labelsGroup, currentStatus, dataNodes, dataLinks, currentStatusValueSpan });

	const linksList = drawLinksList({ dataLinksOriginal, sideDivContainer, previousLinks });

	highlight({ nodesGroup, linksGroup, labelsGroup, linksList, flowChartHoveredSpan });

};