const constants = {
	closedStatusNames: ["PRJ_PRJ_CLR", "PRJ_UND_CLSR"],
	implementationStatuses: [
		"Under Implementation",
		"Implemented",
		"Under Closure/Closed",
	],
	beneficiariesSplitOrder: [3, 5, 6, 2, 4], //IDP|Refugees|Returnees|Host Communities|Others
	isProdSite: window.location.hostname === "cbpf.data.unocha.org",
	charts: [
		"summary",
		"pictogram",
		"beneficiaryTypes",
		"sectors",
		"organizations",
		"leadership",
	],
	filterTypes: ["Fund", "Year", "Allocation Source", "Allocation Type"],
	beneficiaryCategories: ["women", "men", "girls", "boys"],
	organizationLeadership: ["wlo", "rlo", "opd", "ylo"],
} as const;

export default constants;
