import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { flowNodesGenerator, flowLinksGenerator, calculateFreeRowsAndColumns } from "./flowgenerator.js";
import { stylesList } from "./styleslist.js";
import { constants, variables } from "./constants.js";
import { drawNodes } from "./drawnodes.js";
import { drawLinksList } from "./drawlinkslist.js";

const {
	classPrefix,
	chartContainer,
	defaultNumberOfColumns
} = constants;

const numberOfColumnsDataset = +chartContainer.node().dataset.columns;

const flowChartDiv = chartContainer.append("div")
	.attr("class", classPrefix + "flowChartDiv");

const sideDiv = chartContainer.append("div")
	.attr("class", classPrefix + "sideDiv");

const sideDivTitle = sideDiv.append("div")
	.attr("class", classPrefix + "sideDivTitle");

const sideDivContainer = sideDiv.append("div")
	.attr("class", classPrefix + "sideDivContainer");

const details = sideDivTitle.append("div").append("details");

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

	const { nodes: dataNodesOriginal, links: dataLinksOriginal } = data;

	const numberOfColumns = data.numberOfColumns ?? numberOfColumnsDataset ?? defaultNumberOfColumns;

	const dataNodes = flowNodesGenerator({ dataNodesOriginal, width, numberOfColumns, svg });

	const freeRowsAndColumns = calculateFreeRowsAndColumns(dataNodes);

	svg.attr("height", variables.height);

	drawNodes({ dataNodes, svg });

	drawLinksList({ dataLinksOriginal, sideDivContainer });

};