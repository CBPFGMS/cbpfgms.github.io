export const constants = {
	rootElementId: "contributions-fasttrack-root",
	currentYear: new Date().getFullYear(),
	pageName: "CBPFAttribution",
	localStorageTime: 60 * 60 * 1000, //1 hour
	consoleStyle: "background-color: #0d6cb6; color: white; padding: 2px;",
	isProdSite: window.location.hostname === "cbpf.data.unocha.org",
	cutOffDate: new Date("2026-07-01"),
	tranches: [1, 2, "all"],
	contributionTypes: ["total", "paid", "pledged"],
	minWidth: 1200,
	sortByOptions: ["contributions", "alphabetical"],
	chartRowHeight: 36,
	transitionDuration: 750,
	chartTopPadding: 18,
	chartPadding: 16,
} as const;
