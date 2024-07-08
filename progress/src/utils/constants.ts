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
		"indicators",
	],
	filterTypes: ["Fund", "Year", "Allocation Source", "Allocation Type"],
	beneficiaryCategories: ["women", "men", "girls", "boys"],
} as const;

export default constants;
