export const constants = {
	rootElementId: "attributionroot",
	fundType: 1,
	currentYear: new Date().getFullYear(),
	beneficiaryCategories: ["women", "girls", "men", "boys"],
	beneficiariesStatuses: ["targeted", "reached"],
	pageName: "CBPFAttribution",
	localStorageTime: 60 * 60 * 1000, //1 hour
	consoleStyle: "background-color: #0d6cb6; color: white; padding: 2px;",
	isProdSite: window.location.hostname === "cbpf.data.unocha.org",
	charts: [
		"genderAndAge",
		"organizations",
		"sectors",
		"partners",
		"regions",
		"locations",
	],
	partnersHeader: ["partner", "sector", "budget", "projects", "funds"],
	columnWidthsPartners: ["35%", "15%", "36%", "7%", "7%"],
	partnerBarMaxWidth: 82,
	partnerBarHeight: 24,
	limitScaleValueInPixels: 90,
	disclaimerWarningColor: "#e07b00",
	disclaimerText:
		"Disclaimer: Beneficiary figures are calculated using a hybrid methodology designed to minimize double counting across activities and locations. As a result, totals may not fully reconcile when applying different filters or comparing across views.",
	totalBeneficiairesText:
		"Calculation of unique beneficiaries are underway, will be published soon.",
	USCode: 102,
} as const;
