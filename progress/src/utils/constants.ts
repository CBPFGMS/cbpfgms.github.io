const constants = {
	closedStatusNames: ["PRJ_PRJ_CLR", "PRJ_UND_CLSR"],
	implementationStatuses: [
		"Under Implementation",
		"Implemented",
		"Under Closure/Closed",
	],
	beneficiariesSplitOrder: [7, 5, 6, 2, 4], //IDP|Refugees|Returnees|Host Communities|Others
	allocationTypeIdSeparator: "#",
	isProdSite: window.location.hostname === "cbpf.data.unocha.org",
} as const;

export default constants;
