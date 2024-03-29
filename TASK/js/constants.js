/* global d3 */

const constants = Object.freeze({
	classPrefix: "task",
	userRolesToIgnore: ["GMSAdmin"],
	userRolesToIgnoreForList: [],
	chartContainer: d3.select("#chartContainer"),
	get dialogContainer() {
		return d3.select("#dialogContainer").size()
			? d3.select("#dialogContainer")
			: this.chartContainer
					.append("dialog")
					.attr("id", "dialogContainer");
	},
	maxNodeCharactersNumber: 200,
	maxLinkCharacterNumber: 200,
	rowHeight: 100,
	rowHeightLinear: 110,
	rowHeightIncrement: 20,
	defaultNumberOfColumns: 2,
	innerPaddingPercentage: 0.3,
	padding: [10, 10, 10, 10],
	paddingLinear: [10, 10, 10, 10],
	xScalePadding: 0.5,
	yScalePadding: 0.5,
	nodesTextPaddingVertical: 8,
	nodesTextPaddingHorizontal: 12,
	nodesTextSpacing: 12,
	/** @type {scalePoint} */
	xScale: d3.scalePoint(),
	/** @type {scalePoint} */
	yScale: d3.scalePoint(),
	yScaleLinear: d3.scalePoint(),
	minLinkDistanceFromNodes: 4,
	connectionPositions: ["top", "right", "bottom", "left"],
	viewTypes: ["workflow", "list"],
	get defaultView() {
		return this.viewTypes[0];
	},
	cornerRadius: 4,
	linkPaddingFromNode: 4,
	labelCircleRadius: 12,
	labelCirclePadding: 4,
	fadeOpacityNodes: 0.1,
	fadeOpacityLinks: 0.1,
	fadeOpacityLinkLabels: 0.1,
	fadeOpacityLinkListBase: 0.4,
	fadeOpacityLinkList: 1,
	backgroundColor: "#f0f2f5",
	currentStatusFillColor: "#5392cb",
	currentStatusTextFillColor: "white",
	previousStepsColor: "#1a9850",
	previousStepsColorWithOpacity: "rgb(207,224,214)",
	nextStepsColor: "#bbb",
	stepsColorOpacity: 0.2,
	previousStepsStroke: 2,
	nextStepsOpacity: 1, //keep at 1 while testing other alternatives
	defaultHoverText: "Hover over the nodes for additional information",
	firstAlphabetLetter: "a".charCodeAt(0),
	additionalTasksColors: d3
		.scaleOrdinal()
		.range(["#deebf7", "#fee6ce"])
		.domain(["Completed", "Closed"]),
	lineGenerator: d3
		.line()
		// @ts-ignore
		.x(d => d.x)
		// @ts-ignore
		.y(d => d.y)
		.curve(d3.curveBasis),
	taskDateParser: d3.utcParse("%Y-%m-%dT%H:%M:%S.%L"),
	taskDateFormatter: d3.timeFormat("%d %b %Y at %H:%M:%S"),
});

const variables = {
	heightValue: null,
};

for (const key in variables) {
	const actualKey = key.replace("Value", "");
	Object.defineProperty(variables, actualKey, {
		get() {
			return this[key];
		},
		set(value) {
			this[key] = value;
		},
	});
}

export { constants, variables };
