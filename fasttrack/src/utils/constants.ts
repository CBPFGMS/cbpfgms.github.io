const constants = {
	rootElementId: "fasttrackroot",
	fundType: 1,
	beneficiaryCategories: ["women", "girls", "men", "boys"],
	beneficiariesStatuses: ["targeted", "reached"],
	pageName: "CBPFFastTrack",
	localStorageTime: 60 * 60 * 1000, //1 hour
	consoleStyle: "background-color: #0d6cb6; color: white; padding: 2px;",
	isProdSite: window.location.hostname === "cbpf.data.unocha.org",
	charts: ["indicators", "partners", "regions", "sectors"],
	reportTypes: [0, 1, 2],
	indicatorsHeader: ["indicator", "projects", "targeted", "reached"],
	columnWidths: ["52%", "8%", "20%", "20%"],
	columnWidthsExpanded: ["26%", "6%", "34%", "34%"],
} as const;

export { constants };
