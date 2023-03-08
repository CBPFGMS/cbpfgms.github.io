import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { stylesList } from "./styleslist.js";
import { constants, variables } from "./constants.js";

const {
	classPrefix,
	nodesTextSpacing,
	previousStepsColor,
	nextStepsColor
} = constants;

function drawLinksList({ dataLinksOriginal, sideDivContainer, currentLinks }) {

	const dataList = dataLinksOriginal.map(({ id, text, source, target }) => ({ id, text, source, target }))
		.sort((a, b) => a.id - b.id)
		.filter(({ text }) => text);

	const dataListPrevious = dataList.filter(d => currentLinks.includes(d.id)),
		dataListNext = dataList.filter(d => !currentLinks.includes(d.id));

	const stages = sideDivContainer.selectAll(null)
		.data([dataListPrevious, dataListNext])
		.enter()
		.append("div")
		.style("color", (_, i) => i ? nextStepsColor : previousStepsColor)
		.style("background-color", (_, i) => {
			const { r, g, b } = d3.color(i ? nextStepsColor : previousStepsColor);
			return `rgba(${r},${g},${b}, 0.1)`
		})
		.attr("class", classPrefix + "stageDiv");

	stages.append("p")
		.attr("class", classPrefix + "stageText")
		.html((_,i) => i ? "Other steps" : "Steps already completed");

	// const stages = sideDivContainer.selectAll(null)
	// 	.data(d3.range(3))
	// 	.enter()
	// 	.append("div")
	// 	.style("color", d => colors[d])
	// 	.attr("class", classPrefix + "stageDiv");

	stages.each((d, i, n) => {
		const listRows = d3.select(n[i]).selectAll(null)
			.data(d)
			.enter()
			.append("div")
			.attr("class", classPrefix + "listRows");

		const rowNumber = listRows.append("div")
			.attr("class", classPrefix + "listRowsNumber")
			.append("span")
			.html(d => d.id);

		const rowText = listRows.append("div")
			.attr("class", classPrefix + "listRowsText")
			.html(d => d.text);
	});

	const rows = sideDivContainer.selectAll(`.${classPrefix}listRows`);

	return rows;

};

function applyStyles(selection, styles) {
	selection.each((d, i, n) => {
		const thisSelection = d3.select(n[i]);
		Object.entries(styles[d.data.type]).forEach(([key, value]) => {
			thisSelection.style(key, value);
		});
	});
};


export { drawLinksList };