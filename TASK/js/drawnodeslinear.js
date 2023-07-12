import { constants } from "./constants.js";

const { classPrefix } = constants;

function drawNodesLinear({
	dataNodesOriginal,
	dataLinksOriginal,
	flowChartDivList,
	currentStatus,
	currentSequence,
}) {
	const linearContainerDiv = flowChartDivList
		.append("div")
		.attr("class", classPrefix + "linearContainerDiv");
}

export { drawNodesLinear };
