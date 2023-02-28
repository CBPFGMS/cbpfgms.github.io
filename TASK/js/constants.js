import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const constants = {
	classPrefix: "task",
	chartContainer: d3.select("#chartContainer"),
	maxNodeCharactersNumber: 200,
	maxLinkCharacterNumber: 200,
	rowHeight: 100,
	rowHeightIncrement: 20,
	defaultNumberOfColumns: 2,
	innerPaddingPercentage: 0.3,
	padding: [10, 10, 10, 10],
	xScalePadding: 0.5,
	yScalePadding: 0.5,
	nodesTextPaddingVertical: 8,
	nodesTextPaddingHorizontal: 12,
	nodesTextSpacing: 12,
	xScale: d3.scalePoint(),
	yScale: d3.scalePoint(),
	minLinkDistanceFromNodes: 4,
	connectionPositions: ["top", "right", "bottom", "left"],
	cornerRadius: 4,
	linkPaddingFromNode: 4,
	labelCircleRadius: 15,
	fadeOpacityNodes: 0.1,
	fadeOpacityLinks: 0.1,
	fadeOpacityLinkLabels: 0.1,
	fadeOpacityLinkList: 0.1,
	currentStatusFillColor: "lightskyblue",
	previousStepsColor: "#1a9850",
	nextStepsColor: "#d73027",
	lineGenerator: d3.line().x(d => d.x).y(d => d.y).curve(d3.curveBasis)
};

const variables = {
	heightValue: null
};

for (const key in variables) {
	const actualKey = key.replace("Value", "");
	Object.defineProperty(variables, actualKey, {
		get() {
			return this[key]
		},
		set(value) {
			this[key] = value
		}
	});
};

export { constants, variables };