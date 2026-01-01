type ApiFile = {
	url: string;
	name: string;
	type: "yearly" | "complete";
};

export const apiFiles: ApiFile[] = [
	{
		url: "https://cbpfapi.unocha.org/vo2/odata/ProjectSummaryV2?",
		name: "ProjectSummaryV2",
		type: "yearly",
	},
	{
		url: "https://cbpfapi.unocha.org/vo2/odata/ProjectSummaryAggV2?",
		name: "ProjectSummaryAggV2",
		type: "yearly",
	},
	{
		url: "https://cbpfapi.unocha.org/vo2/odata/MstPooledFund?$format=csv",
		name: "MstPooledFund",
		type: "complete",
	},
	{
		url: "https://cbpfapi.unocha.org/vo2/odata/MstClusters?$format=csv",
		name: "MstClusters",
		type: "complete",
	},
	{
		url: "https://cbpfapi.unocha.org/vo2/odata/MstOrgType?$format=csv",
		name: "MstOrgType",
		type: "complete",
	},
	{
		url: "https://cbpfapi.unocha.org/vo2/odata/MstAllocationSource?$format=csv",
		name: "MstAllocationSource",
		type: "complete",
	},
	{
		url: "https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&$format=csv",
		name: "AllocationTypes",
		type: "complete",
	},
];
