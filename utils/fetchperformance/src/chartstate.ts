export type SortOptions = (typeof sortOptions)[number];

export const sortOptions = ["total", "download", "response"] as const;

interface IChartState {
	sort: SortOptions;
}

class ChartState implements IChartState {
	private _sort: SortOptions = sortOptions[0];

	get sort() {
		return this._sort;
	}

	set sort(value: SortOptions) {
		this._sort = value;
	}
}

export default new ChartState();
