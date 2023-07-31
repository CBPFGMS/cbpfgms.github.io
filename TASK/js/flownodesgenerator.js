//@ts-ignore
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { constants, variables } from "./constants.js";

const {
	xScale,
	yScale,
	classPrefix,
	padding,
	rowHeight,
	rowHeightIncrement,
	xScalePadding,
	yScalePadding,
	innerPaddingPercentage,
	nodesTextPaddingVertical,
	nodesTextPaddingHorizontal,
	nodesTextSpacing,
} = constants;

function flowNodesGenerator({
	dataNodesOriginal,
	width,
	numberOfColumns,
	svg,
}) {
	dataNodesOriginal.sort((a, b) => a.flowId - b.flowId);

	const dataLength = dataNodesOriginal.length,
		nodes = new Array(dataLength),
		numberOfRows = Math.ceil(dataLength / numberOfColumns);

	variables.height =
		numberOfRows *
			(rowHeight + (numberOfColumns - 1) * rowHeightIncrement) +
		padding[0] +
		padding[2];
	variables.numberOfRows = numberOfRows;
	variables.numberOfColumns = numberOfColumns;

	xScale
		.range([padding[3], width - padding[1]])
		.domain(d3.range(numberOfColumns))
		.padding(xScalePadding);

	yScale
		.range([padding[0], variables.height - padding[2]])
		.domain(d3.range(numberOfRows))
		.padding(yScalePadding);

	const maxRectWidth = xScale.step() * (1 - innerPaddingPercentage),
		minRectWidth = maxRectWidth / 2,
		maxLineSize = maxRectWidth - 2 * nodesTextPaddingHorizontal,
		maxTextSize = 2 * maxRectWidth - 4 * nodesTextPaddingHorizontal;

	const invisibleGroup = svg
		.append("g")
		.style("opacity", 0)
		.style("pointer-events", "none");

	dataNodesOriginal.forEach((node, index) => {
		const xPos = index % numberOfColumns,
			yPos = ~~(index / numberOfColumns);

		const fakeText = invisibleGroup
			.append("text")
			.attr("class", classPrefix + "nodeText")
			.text(node.text);

		const fakeTextLength = fakeText.node().getComputedTextLength();

		const lines = fakeTextLength > maxLineSize ? 2 : 1;

		let textBox, textArray;

		if (lines === 1) {
			textBox = fakeText.node().getBBox();
			textArray = [node.text];
		} else {
			const choppedText =
				fakeTextLength > maxTextSize
					? chopText(fakeText, maxTextSize)
					: node.text;
			textArray = breakStringInTwo(choppedText);
			const fakeTextTwoLines = invisibleGroup
				.append("text")
				.attr("class", classPrefix + "nodeText")
				.attr("y", -nodesTextSpacing)
				.attr("x", 0)
				.text(textArray[0]);
			const fakeTextTwoLinesSpan = fakeTextTwoLines
				.append("tspan")
				.attr("y", nodesTextSpacing)
				.attr("x", 0)
				.text(textArray[1]);
			textArray[1] = chopText(fakeTextTwoLinesSpan, maxRectWidth);
			textBox = fakeTextTwoLines.node().getBBox();
		}

		nodes[index] = {
			data: node,
			column: xPos,
			row: yPos,
			x: xScale(xPos),
			y: yScale(yPos),
			get boundaries() {
				return {
					top: this.y - this.rectHeight / 2,
					bottom: this.y + this.rectHeight / 2,
					left: this.x - this.rectWidth / 2,
					right: this.x + this.rectWidth / 2,
				};
			},
			rectWidth: Math.max(
				minRectWidth,
				Math.min(
					maxRectWidth,
					textBox.width + 2 * nodesTextPaddingHorizontal
				)
			),
			rectHeight: textBox.height + 2 * nodesTextPaddingVertical,
			nodeText: textArray,
		};
	});

	invisibleGroup.remove();

	return nodes;
}

function chopText(fakeText, maxTextSize) {
	const ellipsis = "...",
		words = fakeText.text().split(/\s+/);
	while (fakeText.node().getComputedTextLength() > maxTextSize) {
		words.pop();
		fakeText.text(words.join(" ") + ellipsis);
	}
	return fakeText.text();
}

function breakStringInTwo(str) {
	let mid = Math.floor(str.length / 2),
		left = str.slice(0, mid),
		right = str.slice(mid);

	if (left.slice(-1) !== " " || right[0] !== " ") {
		let spaceIndex = left.lastIndexOf(" ");
		if (spaceIndex !== -1) {
			left = str.slice(0, spaceIndex);
			right = str.slice(spaceIndex + 1);
		}
	}

	return [left, right];
}

export { flowNodesGenerator };
