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
	partnersHeader: ["partner", "sector", "budget", "projects", "funds"],
	columnWidthsPartners: ["35%", "15%", "36%", "7%", "7%"],
	partnerBarMaxWidth: 82,
	partnerBarHeight: 24,
	limitScaleValueInPixels: 90,
	projectStatusDescription: {
		1: "Submission of Proposal",
		2: "Under Review",
		3: "Under Final Approval",
		4: "Under Implementation",
		5: "Final Reporting",
		6: "Project Closure",
	},
	submissionAndUnderApprovalProjects: [1, 2, 3],
	implementationAndReportingProjects: [4, 5, 6],
	disclaimerWarningColor: "#eed202",
	disclaimerText:
		"Disclaimer: Figures for people targeted/reached may include double counting as same people may receive assistance from multiple clusters/sectors/projects.",
	totalBeneficiairesText:
		"Calculation of unique beneficiaries are underway, will be published soon.",
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
