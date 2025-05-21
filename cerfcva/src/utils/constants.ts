const constants = {
	HARDCODED_TOTAL_SIZE: 447000,
	isProdSite: window.location.hostname === "cbpf.data.unocha.org",
	charts: ["types", "sectors", "agencies", "countries"],
} as const;

export default constants;
