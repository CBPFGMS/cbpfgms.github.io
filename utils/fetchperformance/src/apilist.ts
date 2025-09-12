type Charts =
	| "Allocations_overview"
	| "Results_dashboard"
	| "Progress_dashboard"
	| "CBPF_vs_HRP"
	| "CBPF_by_year"
	| "Allocation_flow"
	| "Allocations"
	| "Allocations_timeline"
	| "Contributions"
	| "Contribution_trends"
	| "Funding_overview"
	| "Sectors"
	| "Targeted_and_reached_people"
	| "Gender_with_age_marker";

type ApiType = "data" | "master";

type ApiListDatum = {
	apiName: string;
	id: number;
	url: string;
	queryString: string | null;
	charts: Charts[];
	apiType: ApiType;
	maxTimeout?: number;
};

export type ApiList = readonly ApiListDatum[];

const currentYear = new Date().getFullYear();

export const apiList: ApiList = [
	{
		id: 1,
		apiName: "masterDonors",
		url: "https://cbpfgms.github.io/pfbi-data/mst/MstDonor.json",
		queryString: null,
		charts: ["CBPF_by_year"],
		apiType: "master",
	},
	{
		id: 2,
		apiName: "masterFunds",
		url: "https://cbpfgms.github.io/pfbi-data/mst/MstCountry.json",
		queryString: null,
		charts: ["CBPF_by_year", "Results_dashboard"],
		apiType: "master",
	},
	{
		id: 3,
		apiName: "masterRegionalFunds",
		url: "https://cbpfgms.github.io/pfbi-data/mst/MstRhpf.json",
		queryString: null,
		charts: [
			"Contributions",
			"Allocations",
			"Funding_overview",
			"Gender_with_age_marker",
			"CBPF_vs_HRP",
		],
		apiType: "master",
	},
	{
		id: 4,
		apiName: "masterAllocationTypes",
		url: "https://cbpfgms.github.io/pfbi-data/mst/MstAllocation.json",
		queryString: null,
		charts: ["CBPF_by_year", "Results_dashboard"],
		apiType: "master",
	},
	{
		id: 5,
		apiName: "launchedAllocationsData",
		url: "https://cbpfapi.unocha.org/vo2/odata/AllocationTypes",
		queryString: "?PoolfundCodeAbbrv=&$format=csv",
		charts: [
			"CBPF_by_year",
			"Allocation_flow",
			"Allocations",
			"Allocations_timeline",
			"Sectors",
			"Gender_with_age_marker",
			"Progress_dashboard",
			"Allocations_overview",
		],
		apiType: "data",
	},
	{
		id: 6,
		apiName: "contributionsData",
		url: "https://cbpfgms.github.io/pfbi-data/contributionSummarySankey.csv",
		queryString: null,
		charts: ["CBPF_by_year"],
		apiType: "data",
	},
	{
		id: 7,
		apiName: "allocationFlowData",
		url: "https://cbpfapi.unocha.org/vo2/odata/AllocationFlowByOrgType",
		queryString: "?PoolfundCodeAbbrv=&$format=csv",
		charts: ["Allocation_flow"],
		apiType: "data",
	},
	{
		id: 8,
		apiName: "masterPooledFunds",
		url: "https://cbpfapi.unocha.org/vo2/odata/MstPooledFund",
		queryString: "?$format=csv",
		charts: [
			"Allocation_flow",
			"Progress_dashboard",
			"Allocations_overview",
		],
		apiType: "master",
	},
	{
		id: 9,
		apiName: "masterPartners",
		url: "https://cbpfapi.unocha.org/vo2/odata/MstOrgType",
		queryString: "?$format=csv",
		charts: [
			"Allocation_flow",
			"Progress_dashboard",
			"Allocations_overview",
		],
		apiType: "master",
	},
	{
		id: 10,
		apiName: "masterSubPartners",
		url: "https://cbpfapi.unocha.org/vo2/odata/SubIPType",
		queryString: "?$format=csv",
		charts: ["Allocation_flow"],
		apiType: "master",
	},
	{
		id: 11,
		apiName: "allocationsData",
		url: "https://cbpfapi.unocha.org/vo2/odata/AllocationBudgetTotalsByYearAndFund",
		queryString: "?&FundingType=3&$format=csv",
		charts: ["Allocations"],
		apiType: "data",
	},
	{
		id: 12,
		apiName: "contributionsTotalData",
		url: "https://cbpfapi.unocha.org/vo2/odata/ContributionTotal",
		queryString: "?$format=csv&ShowAllPooledFunds=1",
		charts: ["Contributions", "Contribution_trends", "Funding_overview"],
		apiType: "data",
	},
	{
		id: 13,
		apiName: "targetedPersonsData",
		url: "https://cbpfapi.unocha.org/vo2/odata/PoolFundBeneficiarySummary",
		queryString: "?$format=csv&ShowAllPooledFunds=1",
		charts: ["Sectors"],
		apiType: "data",
	},
	{
		id: 14,
		apiName: "targetedPersonsDetailsData",
		url: "https://cbpfapi.unocha.org/vo2/odata/ProjectSummaryBeneficiaryDetail",
		queryString: "?$format=csv",
		charts: ["Targeted_and_reached_people"],
		apiType: "data",
	},
	{
		id: 15,
		apiName: "dataGam",
		url: "https://cbpfapi.unocha.org/vo2/odata/ProjectGAMSummary",
		queryString: "?$format=csv",
		charts: ["Gender_with_age_marker"],
		apiType: "data",
	},
	{
		id: 16,
		apiName: "masterGam",
		url: "https://cbpfapi.unocha.org/vo2/odata/GenderMarker",
		queryString: "?$format=csv",
		charts: ["Gender_with_age_marker"],
		apiType: "master",
	},
	{
		id: 17,
		apiName: "masterOrganizations",
		url: "https://cbpfgms.github.io/pfbi-data/mst/MstOrganization.json",
		queryString: null,
		charts: ["Results_dashboard"],
		apiType: "master",
	},
	{
		id: 18,
		apiName: "masterSectors",
		url: "https://cbpfgms.github.io/pfbi-data/mst/MstCluster.json",
		queryString: null,
		charts: ["Results_dashboard"],
		apiType: "master",
	},
	{
		id: 19,
		apiName: "allocationsDataResults",
		url: "https://cbpfapi.unocha.org/vo2/odata/AllocationBudgetTotalsByYearAndFund",
		queryString: "?poolfundAbbrv=&$format=csv",
		charts: ["Results_dashboard"],
		apiType: "data",
	},
	{
		id: 20,
		apiName: "resultsBySector",
		url: "https://cbpfgms.github.io/pfbi-data/cbpf/results/ByCluster.csv",
		queryString: null,
		charts: ["Results_dashboard"],
		apiType: "data",
	},
	{
		id: 21,
		apiName: "resultsByDisability",
		url: "https://cbpfgms.github.io/pfbi-data/cbpf/results/ByGender_Disability.csv",
		queryString: null,
		charts: ["Results_dashboard"],
		apiType: "data",
	},
	{
		id: 22,
		apiName: "resultsByType",
		url: "https://cbpfgms.github.io/pfbi-data/cbpf/results/ByLocation.csv",
		queryString: null,
		charts: ["Results_dashboard"],
		apiType: "data",
	},
	{
		id: 23,
		apiName: "resultsByBeneficiaryType",
		url: "https://cbpfgms.github.io/pfbi-data/cbpf/results/ByType.csv",
		queryString: null,
		charts: ["Results_dashboard"],
		apiType: "data",
	},
	{
		id: 24,
		apiName: "resultsByOrganization",
		url: "https://cbpfgms.github.io/pfbi-data/cbpf/results/ByOrganization.csv",
		queryString: null,
		charts: ["Results_dashboard"],
		apiType: "data",
	},
	{
		id: 25,
		apiName: "masterLocations",
		url: "https://cbpfgms.github.io/pfbi-data/cbpf/results/locationMst.csv",
		queryString: null,
		charts: ["Results_dashboard"],
		apiType: "master",
	},
	{
		id: 26,
		apiName: "masterBeneficiaryType",
		url: "https://cbpfgms.github.io/pfbi-data/cbpf/results/MstBeneficiaryType.csv",
		queryString: null,
		charts: ["Results_dashboard", "Progress_dashboard"],
		apiType: "master",
	},
	{
		id: 27,
		apiName: "projectSummaryProgress",
		url: "https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract",
		queryString: `?SPCode=PF_PROJ_SUMMARY&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${currentYear}&FundTypeId=1&$format=csv`,
		charts: ["Progress_dashboard"],
		apiType: "data",
	},
	{
		id: 28,
		apiName: "sectorsData",
		url: "https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract",
		queryString: `?SPCode=PF_RPT_CLST_BENEF&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${currentYear}&FundTypeId=1&$format=csv`,
		charts: ["Progress_dashboard"],
		apiType: "data",
	},
	{
		id: 29,
		apiName: "globalIndicators",
		url: "https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract",
		queryString:
			"?SPCode=PF_GLB_INDIC&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=&IndicatorTypeId=&FundTypeId=1&$format=csv",
		charts: ["Progress_dashboard"],
		apiType: "data",
	},
	{
		id: 30,
		apiName: "masterOrganizationsProgress",
		url: "https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract",
		queryString:
			"?SPCode=PF_ORG_SUMMARY&PoolfundCodeAbbrv=&FundTypeId=1&$format=csv",
		charts: ["Progress_dashboard"],
		apiType: "master",
	},
	{
		id: 31,
		apiName: "projectStatusMaster",
		url: "https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract",
		queryString:
			"?SPCode=PF_GLB_STATUS&PoolfundCodeAbbrv=&InstanceTypeId=&FundTypeId=1&$format=csv",
		charts: ["Progress_dashboard"],
		apiType: "master",
	},
	{
		id: 32,
		apiName: "masterAllocationSource",
		url: "https://cbpfapi.unocha.org/vo2/odata/MstAllocationSource",
		queryString: "?$format=csv",
		charts: ["Progress_dashboard", "Allocations_overview"],
		apiType: "master",
	},
	{
		id: 33,
		apiName: "masterSectorsVo2",
		url: "https://cbpfapi.unocha.org/vo2/odata/MstClusters",
		queryString: "?$format=csv",
		charts: ["Progress_dashboard", "Allocations_overview"],
		apiType: "master",
	},
	{
		id: 34,
		apiName: "masterGlobalIndicators",
		url: "https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract",
		queryString: "?SPCode=GLB_INDIC_MST&GlobalIndicatorType=&$format=csv",
		charts: ["Progress_dashboard"],
		apiType: "master",
	},
	{
		id: 35,
		apiName: "masterEmergencies",
		url: "https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract",
		queryString: "?SPCode=EMERG_TYPE_MST&$format=csv",
		charts: ["Progress_dashboard"],
		apiType: "master",
	},
	{
		id: 36,
		apiName: "projectSummary",
		url: "https://cbpfapi.unocha.org/vo2/odata/ProjectSummaryV2",
		queryString: `?AllocationYear=${currentYear}&$format=csv`,
		charts: ["Allocations_overview"],
		apiType: "data",
	},
	{
		id: 37,
		apiName: "projectSummaryAggregate",
		url: "https://cbpfapi.unocha.org/vo2/odata/ProjectSummaryAggV2",
		queryString: `?AllocationYear=${currentYear}&$format=csv`,
		charts: ["Allocations_overview"],
		apiType: "data",
	},
	{
		id: 38,
		apiName: "HRPSummary",
		url: "https://cbpfapi.unocha.org/vo2/odata/HRPCBPFFundingSummary",
		queryString: "?PoolfundCodeAbbrv=&$format=csv",
		charts: ["CBPF_vs_HRP"],
		apiType: "data",
	},
	{
		id: 39,
		apiName: "emergencySummary",
		url: "https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract",
		queryString:
			"?SPCode=PROJECT_EMERGENCY_OneGMS&PoolfundCodeAbbrv=&AllocationYear=&FundTypeId=1&$format=csv",
		charts: ["Progress_dashboard"],
		apiType: "data",
	},
] as const;

export const apiIdsList = apiList.map(d => d.id);
