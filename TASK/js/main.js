import { flowNodesGenerator } from "./flownodesgenerator.js";
import { flowLinksGenerator } from "./flowlinksgenerator.js";
import { constants, variables } from "./constants.js";
import { drawNodes } from "./drawnodes.js";
import { drawLinks } from "./drawlinks.js";
import { drawLinksList } from "./drawlinkslist.js";
import { highlight } from "./highlight.js";
import { showStatus } from "./showstatus.js";
import { processData } from "./processdata.js";
import { fetchFile } from "./fetchfile.js";

const {
	classPrefix,
	chartContainer,
	defaultNumberOfColumns,
	currentStatusFillColor,
} = constants;

const numberOfColumnsDataset = +chartContainer.node().dataset.columns;

const dataUrl = "./data/master.json",
	projectsUrl = "./data/project.json";

const flowChartDivContainer = chartContainer
		.append("div")
		.attr("class", classPrefix + "flowChartDivContainer"),
	sideDiv = chartContainer
		.append("div")
		.attr("class", classPrefix + "sideDiv"),
	flowChartCurrentStatusDiv = sideDiv
		.append("div")
		.attr("class", classPrefix + "flowChartCurrentStatusDiv"),
	// eslint-disable-next-line no-unused-vars
	currentStatusText = flowChartCurrentStatusDiv
		.append("span")
		.html("Allocation current status: "),
	currentStatusValueSpan = flowChartCurrentStatusDiv
		.append("span")
		.attr("class", classPrefix + "currentStatusValueSpan"),
	flowChartDiv = flowChartDivContainer
		.append("div")
		.attr("class", classPrefix + "flowChartDiv"),
	sideDivTitle = sideDiv
		.append("div")
		.attr("class", classPrefix + "sideDivTitle"),
	sideDivContainer = sideDiv
		.append("div")
		.attr("class", classPrefix + "sideDivContainer"),
	details = sideDivTitle.append("div").append("details");

details.append("summary").append("span").html("Links description");

details
	.append("p")
	.html(
		"This is a list of the links. Hover over the links below or the numbers on the left to highlight the nodes."
	);

const flowChartDivSize = flowChartDiv.node().getBoundingClientRect();

const { width } = flowChartDivSize;

const svg = flowChartDiv.append("svg").attr("width", width);

Promise.all([
	fetchFile("masterData", dataUrl, "json"),
	fetchFile("projectsData", projectsUrl, "json"),
]).then(createFlowChart);

function createFlowChart([rawData, projectsData]) {
	const data = processData(rawData, projectsData);

	const {
		nodes: dataNodesOriginal,
		links: dataLinksOriginal,
		currentStatus,
		currentSequence,
	} = data;

	const numberOfColumns =
		data.numberOfColumns ??
		numberOfColumnsDataset ??
		defaultNumberOfColumns;

	const dataNodes = flowNodesGenerator({
		dataNodesOriginal,
		width,
		numberOfColumns,
		svg,
	});

	const dataLinks = flowLinksGenerator({ dataLinksOriginal, dataNodes });

	svg.attr("height", variables.height);

	const { linksGroup, labelsGroup } = drawLinks({
		dataLinks,
		svg,
		currentSequence,
	});

	const nodesGroup = drawNodes({ dataNodes, svg });

	currentStatusValueSpan
		.style("text-decoration", "underline")
		.style("text-decoration-thickness", "3px")
		.style("text-underline-offset", "0.3em")
		.style("text-decoration-color", currentStatusFillColor);

	showStatus({
		nodesGroup,
		linksGroup,
		labelsGroup,
		currentStatus,
		currentStatusValueSpan,
		currentSequence,
	});

	const linksList = drawLinksList({
		dataLinksOriginal,
		sideDivContainer,
	});

	highlight({
		nodesGroup,
		linksGroup,
		labelsGroup,
		linksList,
		flowChartCurrentStatusDiv,
		currentStatus,
	});
}
