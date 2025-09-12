import { select } from "d3-selection";

export function createTooltip(): d3.Selection<
	HTMLDivElement,
	unknown,
	HTMLElement,
	any
> {
	const tooltip = select("body")
		.append("div")
		.attr("id", "tooltip")
		.style("display", "none");

	return tooltip;
}
