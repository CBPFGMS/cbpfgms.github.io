import { apiList } from "./apilist";

export type SortOptions = (typeof sortOptions)[number];

export const sortOptions = ["total", "download", "response", "size"] as const;

interface IChartState {
	sort: SortOptions;
	lineChartApi: number;
}

class ChartState implements IChartState {
	private _sort: SortOptions = sortOptions[0];
	private _lineChartApi: number = apiList[0].id;

	get lineChartApi() {
		return this._lineChartApi;
	}

	set lineChartApi(value: number) {
		this._lineChartApi = value;
	}

	get sort() {
		return this._sort;
	}

	set sort(value: SortOptions) {
		this._sort = value;
	}
}

export default new ChartState();
