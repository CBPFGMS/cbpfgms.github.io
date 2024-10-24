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
		"disability",
		"emergency",
		"gbv",
		"indicators",
	],
	filterTypes: ["Fund", "Year", "Allocation Source", "Allocation Name"],
	beneficiaryCategories: ["women", "girls", "men", "boys"],
	beneficiariesStatuses: ["targeted", "reached"],
	indicatorsHeader: ["indicator", "projects", "targeted", "reached"],
	columnWidths: ["52%", "8%", "20%", "20%"],
	columnWidthsExpanded: ["26%", "6%", "34%", "34%"],
	reportTypes: [0, 1, 2],
	reportsForDisability: [1, 2],
	reportsForGBV: [2],
	finalReportCode: 2,
	emergencyChartTypes: ["overview", "timeline"],
	emergencyChartModes: ["aggregated", "byGroup"],
	emergencyTimelineGroupHeight: 256,
	emergencyTimelineAggregatedGroupHeight: 296,
	emergencyOverviewAggregatedRowHeight: 44,
	emergencyOverviewByGroupRowHeight: 38,
	emergencyOverviewGap: 12,
	emergencyChartMargins: { top: 6, right: 12, bottom: 6, left: 6 },
	emergencyOverviewLeftMarginAggregated: 150,
	emergencyOverviewLeftMarginByGroup: 280,
	emergencyTimelineLeftMargin: 282,
	emergencyColors: {
		1: "#7fc97f",
		2: "#beaed4",
		3: "#ffff99",
		4: "#fdc086",
		5: "#386cb0",
		6: "#f0027f",
	},
	duration: 750,
	monthsArray: [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	],
	emergencyOverviewDomainPadding: 1,
	emergencyTimelineDomainPadding: 1.1,
	overviewIconSize: 24,
	overviewIconSizeByGroup: 32,
	overviewScalePaddingInner: 0.4,
	overviewScalePaddingOuter: 0.5,
	overviewAxisWidth: 100,
	overviewAxisByGroupWidth: 110,
	emergencyTypesGroupRowHeight: 20,
	emergencyTypesGroupCircleRadius: 6,
	idString: "id_",
	stackGap: 2,
	fullMonthNames: {
		Jan: "January",
		Feb: "February",
		Mar: "March",
		Apr: "April",
		May: "May",
		Jun: "June",
		Jul: "July",
		Aug: "August",
		Sep: "September",
		Oct: "October",
		Nov: "November",
		Dec: "December",
	},
} as const;

export default constants;
