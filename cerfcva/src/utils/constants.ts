const constants = {
	isProdSite: window.location.hostname === "cbpf.data.unocha.org",
	charts: [],
	filterTypes: [],
	beneficiaryCategories: ["women", "girls", "men", "boys"],
	beneficiariesStatuses: ["targeted", "reached"],
} as const;

export default constants;
