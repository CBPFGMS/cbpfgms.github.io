const constants = {
	pageName: "IndicatorsFastTrack",
	localStorageTime: 60 * 60 * 1000, //1 hour
	consoleStyle: "background-color: #0d6cb6; color: white; padding: 2px;",
	isProdSite: window.location.hostname === "cbpf.data.unocha.org",
	projectStatusDescription: {
		1: "Submission of Proposal",
		2: "Under Review",
		3: "Under Final Approval",
		4: "Under Implementation",
		5: "Final Reporting",
		6: "Project Closure",
	},
	pipeSeparator: "|||",
	hashtagSeparator: "##",
} as const;

const projectStatusMaster = {
	1: "Submission of Proposal",
	2: "Under Review",
	3: "Under Final Approval",
	4: "Under Implementation",
	5: "Final Reporting",
	6: "Project Closure",
};

const projectStatusMapping: Record<number, number> = {
	1: 1,
	2: 1,
	3: 2,
	4: 3,
	5: 4,
	6: 4,
	7: 5,
	8: 6,
};

export { constants, projectStatusMaster, projectStatusMapping };
