const constants = {
	closedStatusNames: ["PRJ_PRJ_CLR", "PRJ_UND_CLSR"],
	implementationStatuses: [
		"Under Implementation",
		"Programmatically Closed",
		"Financially Closed",
	],
	beneficiariesSplitOrder: [3, 5, 6, 2, 4], //IDP|Refugees|Returnees|Host Communities|Others
	isProdSite: window.location.hostname === "cbpf.data.unocha.org",
	charts: [
		"summary",
		"pictogram",
		"beneficiaryTypes",
		"sectors",
		"organizations",
		"disability",
		"gbv",
		"indicators",
	],
	filterTypes: ["Fund", "Year", "Allocation Source", "Allocation Type"],
	beneficiaryCategories: ["women", "girls", "men", "boys"],
	beneficiariesStatuses: ["targeted", "reached"],
	indicatorsHeader: ["indicator", "targeted", "reached"],
	columnWidths: ["60%", "20%", "20%"],
	columnWidthsExpanded: ["32%", "34%", "34%"],
	reportTypes: [0, 1, 2],
	reportsForDisability: [1, 2],
	reportsForGBV: [2],
} as const;

export default constants;
