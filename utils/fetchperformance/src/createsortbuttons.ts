import { select, selectAll } from "d3-selection";
import chartState, { sortOptions, type SortOptions } from "./chartstate";

export type SortButtons = d3.Selection<
	HTMLButtonElement,
	SortOptions,
	HTMLDivElement,
	boolean
>;

function createSortButtons(): SortButtons {
	let buttonsContainer = select<HTMLDivElement, unknown>("#buttonsContainer");

	let buttons = buttonsContainer
		.selectAll<HTMLButtonElement, SortOptions>(".rainButton")
		.data(sortOptions);

	buttons = buttons
		.enter()
		.append("button")
		.attr("class", "rainButton")
		.html(d =>
			d === "total"
				? "Total"
				: d === "download"
				? "Avegage Download Time"
				: "Average Response Time"
		)
		.merge(buttons);

	buttons.classed("active", d => d === chartState.sort);

	return buttons;
}

export { createSortButtons };
