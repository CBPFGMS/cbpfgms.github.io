const constants = {
	HARDCODED_TOTAL_SIZE: 447000,
	isProdSite: window.location.hostname === "cbpf.data.unocha.org",
	charts: ["types", "sectors", "agencies", "countries"],
	get summaryCharts() {
		return this.charts.filter(chart => chart !== "countries");
	},
	allocationWindows: ["rr", "ufe"],
	filtersSummary: ["Year", "Country", "Allocation Window"],
	filtersCountries: ["Year", "Sector", "Partner"],
	filterTypes: ["dropdowncheck", "search", "checkbox"],
	firstYearOfCvaData: 2024,
} as const;

export default constants;
