const constants = {
	HARDCODED_TOTAL_SIZE: 481_000,
	pageName: "CBPFCVA",
	localStorageTime: 60 * 60 * 1000, //1 hour
	consoleStyle: "background-color: #0d6cb6; color: white; padding: 2px;",
	isProdSite: window.location.hostname === "cbpf.data.unocha.org",
	charts: ["funds", "cvaTypes", "sectors"],
	filters: ["Year", "Organization Type"],
	allocationSources: ["standard", "reserve"],
	firstYearOfCvaData: 2024,
	limitScaleValueInPixels: 90,
	unselectedFundOpacity: 0.2,
	unselectedCvaTypeOpacity: 0.2,
	sortingOrder: ["ascending", "descending"],
	fundChartSorting: ["totalAllocations", "cvaAllocations"],
	cvaPopoverWidth: 520,
} as const;

export default constants;
