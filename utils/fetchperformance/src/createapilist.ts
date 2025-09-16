import { apiList, type ApiList } from "./apilist";

const columns = ["API Name", "Endpoint", "Type", "Charts"] as const;

export function createApiList() {
	const table = document
		.querySelector<HTMLTableElement>("#apiListContainer")
		?.appendChild(document.createElement("table"));

	const thead = table
		?.appendChild(document.createElement("thead"))
		.appendChild(document.createElement("tr"));

	columns.forEach(column => {
		if (thead) {
			thead.appendChild(document.createElement("th")).textContent =
				column;
		}
	});

	const tbody = table?.appendChild(document.createElement("tbody"));

	const sortedApiList: ApiList = [...apiList].sort((a, b) =>
		a.apiName.localeCompare(b.apiName)
	);

	sortedApiList.forEach(datum => {
		const tr = tbody?.appendChild(document.createElement("tr"));
		columns.forEach(column => {
			const td = tr?.appendChild(document.createElement("td"));
			switch (column) {
				case "API Name":
					td!.textContent = datum.apiName;
					break;
				case "Endpoint":
					const a = td!.appendChild(document.createElement("a"));
					a.textContent = datum.url;
					a.href = datum.url + (datum.queryString ?? "");
					a.target = "_blank";
					break;
				case "Type":
					td!.textContent = datum.apiType;
					break;
				case "Charts":
					td!.textContent = datum.charts.join(", ");
					break;
			}
		});
	});
}
