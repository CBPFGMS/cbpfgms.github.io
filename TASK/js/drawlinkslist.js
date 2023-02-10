import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { stylesList } from "./styleslist.js";
import { constants, variables } from "./constants.js";

const {
	classPrefix,
	nodesTextSpacing
} = constants;

function drawLinksList({ dataLinksOriginal, sideDivContainer }) {

	const colors = ['#1b9e77', '#d95f02', '#7570b3'];

	const dataList = dataLinksOriginal.map(({ id, text }) => ({ id, text }))
		.sort((a, b) => a.id - b.id)
		.filter(({ text }) => text);

	const dataListFoo = dataList.slice(0, 4),
		dataListBar = dataList.slice(4, 9),
		dataListBaz = dataList.slice(9);

	const stages = sideDivContainer.selectAll(null)
		.data(d3.range(3))
		.enter()
		.append("div")
		.style("color", d => colors[d])
		.style("background-color", d => {
			const { r, g, b } = d3.color(colors[d])
			return `rgba(${r},${g},${b}, 0.1)`
		})
		.attr("class", classPrefix + "stageDiv");

	stages.append("p")
		.attr("class", classPrefix + "stageText")
		.html(d => `Stage: ${!d ? "foo" : d === 1 ? "bar" : "baz"}...`);

	// const stages = sideDivContainer.selectAll(null)
	// 	.data(d3.range(3))
	// 	.enter()
	// 	.append("div")
	// 	.style("color", d => colors[d])
	// 	.attr("class", classPrefix + "stageDiv");

	stages.each((d, i, n) => {
		const thisData = !d ? dataListFoo : d === 1 ? dataListBar : dataListBaz;
		const listRows = d3.select(n[i]).selectAll(null)
			.data(thisData)
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