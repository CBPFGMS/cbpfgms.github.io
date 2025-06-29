const constants = {
	HARDCODED_TOTAL_SIZE: 481_000,
	isProdSite: window.location.hostname === "cbpf.data.unocha.org",
	charts: ["funds", "types"],
	filters: ["Year", "Organization Type"],
	allocationSources: ["standard", "reserve"],
	firstYearOfCvaData: 2024,
} as const;

export default constants;
