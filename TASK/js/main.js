import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { flowNodesGenerator, flowLinksGenerator } from "./flowgenerator.js";
import { stylesList } from "./styleslist.js";

const classPrefix = "taskFlowChart",
	chartContainer = d3.select("#chartContainer"),
	containerSize = chartContainer.node().getBoundingClientRect(),
	maxNodeCharactersNumber = 200,
	maxLinkCharacterNumber = 200,
	padding = [10, 10, 10, 10];

const { width, height } = containerSize;

const svg = chartContainer.append("svg")
	.attr("viewBox", `0 0 ${width} ${height}`);

d3.json("./data/data.json").then(createFlowChart);

function createFlowChart(data) {

	const { nodes: dataNodes, links: dataLinks } = data;

	flowNodesGenerator({ dataNodes, width, height });

};