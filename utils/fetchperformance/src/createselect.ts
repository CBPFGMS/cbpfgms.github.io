import { select } from "d3-selection";
import { apiList } from "./apilist";
import chartState from "./chartstate";

export type ApiSelect = d3.Selection<
	HTMLSelectElement,
	unknown,
	HTMLElement,
	any
>;

function createSelect(): ApiSelect {
	const selectContainer = select<HTMLDivElement, unknown>("#selectContainer");

	const apiSelect: ApiSelect = selectContainer
		.append("select")
		.attr("id", "apiSelect")
		.on("change", function () {
			const selectedValue = (this as HTMLSelectElement).value;
			const selectedApiId = parseInt(selectedValue, 10);
			if (!isNaN(selectedApiId)) {
				apiSelect.property("value", selectedValue);
				chartState.lineChartApi = selectedApiId;
			}
		});

	const sortedApiList = apiList
		.slice()
		.sort((a, b) => a.apiName.localeCompare(b.apiName));

	apiSelect
		.selectAll<HTMLOptionElement, number>("option")
		.data(sortedApiList.map(api => api.id))
		.enter()
		.append("option")
		.attr("value", d => d.toString())
		.text(d => {
			const api = apiList.find(api => api.id === d);
			return api ? api.apiName : d.toString();
		});

	apiSelect.property("value", sortedApiList[0].id.toString());

	return apiSelect;
}

export { createSelect };
