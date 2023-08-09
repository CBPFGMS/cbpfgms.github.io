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
import { createRadioButtons } from "./radiobuttons.js";
import { drawNodesLinear } from "./drawnodeslinear.js";
import { drawLinksLinear } from "./drawlinkslinear.js";

const {
	classPrefix,
	chartContainer,
	defaultNumberOfColumns,
	currentStatusFillColor,
	defaultView,
	rowHeightLinear,
} = constants;

variables.view = defaultView;

// @ts-ignore
const numberOfColumnsDataset = +chartContainer.node().dataset.columns;

const dataUrl = "./data/master.json",
	projectsUrl = "./data/project.json";

const flowChartDivContainer = chartContainer
		.append("div")
		.attr("class", classPrefix + "flowChartDivContainer"),
	tooltipDiv = chartContainer
		.append("div")
		.attr("class", classPrefix + "tooltipDiv")
		.style("display", "none"),
	sideDiv = chartContainer
		.append("div")
		.attr("class", classPrefix + "sideDiv"),
	flowChartTopDiv = flowChartDivContainer
		.append("div")
		.attr("class", classPrefix + "flowChartTopDiv"),
	flowChartTopDivButtons = flowChartTopDiv
		.append("div")
		.attr("class", classPrefix + "flowChartTopDivButtons"),
	flowChartTopDivCurrentStatus = flowChartTopDiv
		.append("div")
		.attr("class", classPrefix + "flowChartTopDivCurrentStatus"),
	flowChartCurrentStatusDiv = flowChartTopDivCurrentStatus
		.append("div")
		.attr("class", classPrefix + "flowChartCurrentStatusDiv"),
	// eslint-disable-next-line no-unused-vars
	currentStatusText = flowChartCurrentStatusDiv
		.append("span")
		.html("Allocation current status: "),
	currentStatusValueSpan = flowChartCurrentStatusDiv
		.append("span")
		.attr("class", classPrefix + "currentStatusValueSpan"),
	flowChartDivWrapper = flowChartDivContainer
		.append("div")
		.attr("class", classPrefix + "flowChartDivWrapper"),
	flowChartDiv = flowChartDivWrapper
		.append("div")
		.attr("class", classPrefix + "flowChartDiv"),
	flowChartDivLinear = flowChartDivWrapper
		.append("div")
		.attr("class", classPrefix + "flowChartDivLinear"),
	linearContainerDiv = flowChartDivLinear
		.append("div")
		.attr("class", classPrefix + "linearContainerDiv"),
	linearLegendDiv = linearContainerDiv
		.append("div")
		.attr("class", classPrefix + "linearLegendDiv"),
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

/** @type {d3.Selection} */
const svg = flowChartDiv.append("svg").attr("width", width);

/** @type {d3.Selection} */
const svgLinear = linearContainerDiv.append("svg").attr("width", width);

const { inputs: buttons, inputDivs } = createRadioButtons(
	flowChartTopDivButtons
);

buttons.on("click", (event, d) => {
	variables.view = d;
	inputDivs.classed("active", e => e === d);
	switchView();
});

function switchView() {
	if (variables.view === "list") {
		flowChartDivLinear.style("display", "block");
		flowChartDiv.style("display", "none");
		linearContainerDiv.on("scroll", () => {
			tooltipDiv.html(null).style("display", "none");
		});
	} else {
		flowChartDivLinear.style("display", "none");
		flowChartDiv.style("display", "block");
	}
}

Promise.all([
	fetchFile("masterData", dataUrl, "json"),
	fetchFile("projectsData", projectsUrl, "json"),
]).then(createFlowChart);

/** @type {createFlowChart} */
function createFlowChart([rawData, projectsData]) {
	const data = processData(rawData, projectsData);

	const {
		nodes: dataNodesOriginal,
		links: dataLinksOriginal,
		currentStatus,
		currentSequence,
		currentLinearSequence,
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

	variables.heightLinear = currentLinearSequence.length * rowHeightLinear;

	svgLinear.attr("height", variables.heightLinear);

	const { linksGroup, labelsGroup } = drawLinks({
		dataLinks,
		svg,
		currentSequence,
	});

	const nodesGroup = drawNodes({ dataNodes, svg });

	const nodesGroupLinear = drawNodesLinear({
		dataNodesOriginal,
		currentLinearSequence,
		svgLinear,
		width,
		currentStatus,
	});

	const { linksGroupLinear, labelsGroupLinear, subTasksSubGroup } =
		drawLinksLinear({
			dataLinksOriginal,
			nodesGroupLinear,
			currentLinearSequence,
			svgLinear,
			linearLegendDiv,
			tooltipDiv,
			width,
		});

	switchView();

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
		nodesGroupLinear,
		linksGroupLinear,
		labelsGroupLinear,
		subTasksSubGroup,
		linksList,
		flowChartCurrentStatusDiv,
		currentStatus,
	});
}
