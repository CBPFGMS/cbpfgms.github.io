export const constants = {
	rootElementId: "attributionroot",
	fundType: 1,
	currentYear: new Date().getFullYear(),
	beneficiariesSplitOrder: [3, 5, 6, 2, 4], //IDP|Refugees|Returnees|Host Communities|Others
	beneficiaryCategories: ["women", "girls", "men", "boys"],
	beneficiariesStatuses: ["targeted", "reached"],
	pageName: "CBPFAttribution",
	localStorageTime: 60 * 60 * 1000 * 100, //1 hour -- 100 hours, temporary!!!
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
	sortByOptions: ["attribution", "donation", "total", "alphabetical"],
	partnersSplitOrder: [3, 2, 1, 4],
	hasDisabledIds: [7, 8, 9],
	hasGBVIds: [1, 2, 3],
	hasGenderEqualityIds: [5, 6, 25],
	localizationMarkers: ["1.1", "1.2", "1.4"],
} as const;
