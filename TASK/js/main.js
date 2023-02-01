import { stylesList } from "./styleslist.js";

const classPrefix = "taskFlowChart",
	chartContainer = d3.select("#chartContainer"),
	containerSize = chartContainer.node().getBoundingClientRect(),
	containerWidth = containerSize.width,
	containerHeight = containerSize.height,
	flowchartyGenerator = new Flowcharty.default();

const svg = chartContainer.append("svg")
	.attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
	.attr("width", containerWidth)
	.attr("height", containerHeight);


d3.json("./data/data.json").then(createFlowChart);

function createFlowChart(rawData) {

	const flowchartData = processFlowChartData(rawData);

};

function processFlowChartData(rawData) {

	const data = { nodes: [], links: [] };

	return data;

};