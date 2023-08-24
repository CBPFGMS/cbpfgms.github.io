import { useState, useEffect } from "react";
import fetchFile from "./fetchfile";
import makeLists from "./makelists";

//types
type Beneficiaries = number | null;

type ByClusterObj = {
	PooledFundId: number;
	AllocationYear: number;
	ReportApprovedDate: Date;
	AllocationTypeId: number;
	AllocationSourceId: number;
	ClusterId: number;
	ClusterBudget: number;
	TargetedMen: Beneficiaries;
	TargetedWomen: Beneficiaries;
	TargetedBoys: Beneficiaries;
	TargetedGirls: Beneficiaries;
	ReachedMen: Beneficiaries;
	ReachedWomen: Beneficiaries;
	ReachedBoys: Beneficiaries;
	ReachedGirls: Beneficiaries;
};

type ByDisabilityObj = {
	PooledFundId: number;
	AllocationYear: number;
	ReportApprovedDate: Date;
	AllocationtypeId: number;
	AllocationSourceId: number;
	Budget: number;
	TargetedMen: Beneficiaries;
	TargetedWomen: Beneficiaries;
	TargetedBoys: Beneficiaries;
	TargetedGirls: Beneficiaries;
	ReachedMen: Beneficiaries;
	ReachedWomen: Beneficiaries;
	ReachedBoys: Beneficiaries;
	ReachedGirls: Beneficiaries;
	DisabledMen: Beneficiaries;
	DisabledWomen: Beneficiaries;
	DisabledBoys: Beneficiaries;
	DisabledGirls: Beneficiaries;
	ReachedDisabledMen: Beneficiaries;
	ReachedDisabledWomen: Beneficiaries;
	ReachedDisabledBoys: Beneficiaries;
	ReachedDisabledGirls: Beneficiaries;
};

type ByLocationObj = {
	PooledFundId: number;
	AllocationYear: number;
	ApprovedDate: Date;
	LocationID: number;
	AllocationtypeId: number;
	AllocationSourceId: number;
	TargetMen: Beneficiaries;
	TargetWomen: Beneficiaries;
	TargetBoys: Beneficiaries;
	TargetGirls: Beneficiaries;
	ReachedMen: Beneficiaries;
	ReachedWomen: Beneficiaries;
	ReachedBoys: Beneficiaries;
	ReachedGirls: Beneficiaries;
};

type ByTypeObj = {
	PooledFundId: number;
	AllocationYear: number;
	ReportApprovedDate: Date;
	BeneficiaryTypeId: number;
	AllocationtypeId: number;
	AllocationSourceId: number;
	TargetMen: Beneficiaries;
	TargetWomen: Beneficiaries;
	TargetBoys: Beneficiaries;
	TargetGirls: Beneficiaries;
	ReachedMen: Beneficiaries;
	ReachedWomen: Beneficiaries;
	ReachedBoys: Beneficiaries;
	ReachedGirls: Beneficiaries;
};

export type LocationMasterObj = {
	LocationID: number;
	Location: string;
	AdminLocation1: string;
	AdminLocation1Latitude: number;
	AdminLocation1Longitude: number;
};

export type AllocationTypeMasterObj = {
	AllocationTypeId: number;
	AllocationType: string;
};

export type BeneficiariesMasterObj = {
	BeneficiaryTypeId: number;
	BeneficiaryType: string;
};

export type FundsMasterObj = {
	id: number;
	PooledFundName: string;
	PooledFundNameAbbrv: string;
	RegionName: string;
	RegionNameArr: string;
	SubRegionName: string;
	ContinentName: string;
	CountryCode: string;
	ISO2Code: string;
	latitude: number;
	longitude: number;
	CBPFFundStatus: number;
	CBPFId: number;
	CERFId: number;
	AreaType: string;
};

export type AllocationSourcesMasterObj = {
	id: number;
	AllocationName: string;
};

export type PartnerTypesMasterObj = {
	id: number;
	OrganizationTypeName: string;
};

export type SectorsMasterObj = {
	id: number;
	ClustNm: string;
	ClustCode: string;
};

type ListObj = {
	[key: number]: string;
};

type List = {
	[key: string]: ListObj;
};

type RawData = {
	byCluster: ByClusterObj[];
	byDisability: ByDisabilityObj[];
	byLocation: ByLocationObj[];
	byType: ByTypeObj[];
};

function useData() {
	const byClusterUrl =
			"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/sandbox/resultsdata/ByCluster.csv",
		byDisabilityUrl =
			"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/sandbox/resultsdata/ByGender_Disability.csv",
		byLocationUrl =
			"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/sandbox/resultsdata/ByLocation.csv",
		byTypeUrl =
			"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/sandbox/resultsdata/ByType.csv",
		locationMasterUrl =
			"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/sandbox/resultsdata/locationMst.csv",
		beneficiariesMasterUrl =
			"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/sandbox/resultsdata/MstBeneficiaryType.csv",
		allocationTypeMasterUrl =
			"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/master/sandbox/resultsdata/MstAllocationType.csv",
		fundsMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstCountry.json",
		allocationSourcesMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstAllocation.json",
		partnerTypesMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstOrganization.json",
		sectorsMasterUrl =
			"https://cbpfgms.github.io/pfbi-data/mst/MstCluster.json";

	const [rawData, setRawData] = useState<RawData | null>(null),
		[lists, setLists] = useState<List | null>(null),
		[loading, setLoading] = useState<boolean>(true),
		[error, setError] = useState<unknown>(null);

	useEffect(() => {
		Promise.all([
			fetchFile("byCluster", byClusterUrl, "csv"),
			fetchFile("byDisability", byDisabilityUrl, "csv"),
			fetchFile("byLocation", byLocationUrl, "csv"),
			fetchFile("byType", byTypeUrl, "csv"),
			fetchFile("locationMaster", locationMasterUrl, "csv"),
			fetchFile("beneficiariesMaster", beneficiariesMasterUrl, "csv"),
			fetchFile("allocationTypeMaster", allocationTypeMasterUrl, "csv"),
			fetchFile("fundsMaster", fundsMasterUrl, "json"),
			fetchFile(
				"allocationSourcesMaster",
				allocationSourcesMasterUrl,
				"json"
			),
			fetchFile("partnerTypesMaster", partnerTypesMasterUrl, "json"),
			fetchFile("sectorsMaster", sectorsMasterUrl, "json"),
		])
			.then(receiveData)
			.catch(error => {
				setError(error);
				setLoading(false);
			});

		function receiveData([
			byCluster,
			byDisability,
			byLocation,
			byType,
			locationMaster,
			beneficiariesMaster,
			allocationTypeMaster,
			fundsMaster,
			allocationSourcesMaster,
			partnerTypesMaster,
			sectorsMaster,
		]: [
			ByClusterObj[],
			ByDisabilityObj[],
			ByLocationObj[],
			ByTypeObj[],
			LocationMasterObj[],
			BeneficiariesMasterObj[],
			AllocationTypeMasterObj[],
			FundsMasterObj[],
			AllocationSourcesMasterObj[],
			PartnerTypesMasterObj[],
			SectorsMasterObj[]
		]): void {
			const {
				fundNamesList,
				fundAbbreviatedNamesList,
				fundIsoCodes2List,
				fundIsoCodes3List,
				beneficiaryTypesList,
				allocationTypesList,
				allocationSourcesList,
				partnerNamesList,
				sectorNamesList,
				locationNamesList,
				locationLatLongList,
			} = makeLists(
				fundsMaster,
				locationMaster,
				beneficiariesMaster,
				allocationTypeMaster,
				allocationSourcesMaster,
				partnerTypesMaster,
				sectorsMaster
			);

			setRawData({
				byCluster: byCluster,
				byDisability: byDisability,
				byLocation: byLocation,
				byType: byType,
			});
			setLoading(false);
		}
	}, []);

	return { rawData, loading, error };
}

export default useData;
