import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { constants } from "./constants.js";
import { createDialog } from "./dialog.js";

const {
	classPrefix,
	stepsColorOpacity,
	previousStepsColor,
	nextStepsColor,
	dialogContainer,
} = constants;

const localVariable = d3.local();

function drawLinksList({ dataLinksOriginal, sideDivContainer }) {
	const dataList = dataLinksOriginal
		.filter(({ text }) => text)
		.sort((a, b) => a.id - b.id);

	const dataListPrevious = dataList.filter(d => d.isCompleted),
		dataListNext = dataList.filter(d => !d.isCompleted);

	const stages = sideDivContainer
		.selectAll(null)
		.data([dataListPrevious, dataListNext])
		.enter()
		.append("div")
		.style("color", (_, i) => (i ? nextStepsColor : previousStepsColor))
		.style("background-color", (_, i) => {
			const { r, g, b } = d3.color(
				i ? nextStepsColor : previousStepsColor
			);
			return `rgba(${r},${g},${b}, ${stepsColorOpacity})`;
		})
		.attr("class", classPrefix + "stageDiv");

	stages
		.append("p")
		.attr("class", classPrefix + "stageText")
		.html((_, i) => (i ? "Other steps" : "Steps already completed"));

	stages.each((d, i, n) => {
		const listRowsContainer = d3
			.select(n[i])
			.selectAll(null)
			.data(d)
			.enter()
			.append("div")
			.attr("class", classPrefix + "listRowsContainer")
			.each(d => (d.clicked = false));

		const listRows = listRowsContainer
			.append("div")
			.attr("class", classPrefix + "listRows");

		const tasks = listRowsContainer
			.selectAll(null)
			.data(d => d.tasks)
			.enter()
			.append("div")
			.attr("class", classPrefix + "listRowsTasks")
			.style("cursor", (d, i, n) => {
				const parentDatum = d3.select(n[i].parentNode).datum();
				localVariable.set(n[i], parentDatum);
				const foundRole = parentDatum.projectLogs.some(
					({ UserRoleCode }) =>
						UserRoleCode === d.Roles[0].UserRoleCode
				);
				return foundRole ? "pointer" : "default";
			});

		tasks
			.append("div")
			.attr("class", classPrefix + "listRowsTasksDivs")
			.html(d => d.ButtonText);

		listRows
			.append("div")
			.attr("class", classPrefix + "listRowsNumber")
			.style("background-color", () => {
				const { r, g, b } = d3.color(
					i ? nextStepsColor : previousStepsColor
				);
				return `rgba(${r},${g},${b}, ${stepsColorOpacity})`;
			})
			.append("span")
			.html(d => d.id);

		listRows
			.append("div")
			.attr("class", classPrefix + "listRowsText")
			.html(d => d.text);

		listRows
			.append("div")
			.attr("class", classPrefix + "listRowsArrow")
			.append("i")
			.attr("class", "fas fa-angle-down");

		listRowsContainer.on("click", (event, d) => {
			d.clicked = !d.clicked;
			d3.select(event.currentTarget).classed("active", d.clicked);
		});

		tasks.on("click", (event, d) => {
			event.stopPropagation();
			const parentDatum = localVariable.get(event.currentTarget);
			const projectLog = parentDatum.projectLogs.find(
				({ UserRoleCode }) => UserRoleCode === d.Roles[0].UserRoleCode
			);
			if (projectLog)
				createDialog(
					projectLog,
					d3.select(event.currentTarget.parentNode)
				);
			dialogContainer.node().showModal();
		});
	});

	const rows = sideDivContainer.selectAll(`.${classPrefix}listRowsContainer`);

	return rows;
}

export { drawLinksList };
