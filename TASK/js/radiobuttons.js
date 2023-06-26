import { constants, variables } from "./constants.js";

const { classPrefix, viewTypes } = constants;

function createRadioButtons(div) {
	const inputDivs = div
		.selectAll(null)
		.data(viewTypes)
		.enter()
		.append("div")
		.attr("class", classPrefix + "inputDivs")
		.classed("active", d => d === variables.view);

	const labels = inputDivs.append("label").html(d => capitalize(d) + " View");

	const inputs = labels
		.append("input")
		.attr("type", "radio")
		.attr("name", "viewType")
		.attr("value", d => d)
		.property("checked", d => d === variables.view);

	return { inputs, inputDivs };
}

function capitalize(str) {
	return str[0].toUpperCase() + str.substring(1);
}

export default createRadioButtons;
