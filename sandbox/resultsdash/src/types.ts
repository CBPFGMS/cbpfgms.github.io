/* eslint-disable @typescript-eslint/no-unused-vars */

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
	NumbofProjects: number;
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

type LocationMasterObj = {
	LocationID: number;
	Location: string;
	AdminLocation1: string;
	AdminLocation1Latitude: number;
	AdminLocation1Longitude: number;
};

type AllocationTypeMasterObj = {
	AllocationTypeId: number;
	AllocationType: string;
};

type BeneficiariesMasterObj = {
	BeneficiaryTypeId: number;
	BeneficiaryType: string;
};

type FundsMasterObj = {
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

type AllocationSourcesMasterObj = {
	id: number;
	AllocationName: string;
};

type PartnerTypesMasterObj = {
	id: number;
	OrganizationTypeName: string;
};

type SectorsMasterObj = {
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

type MakeListParams = {
	fundsMaster: FundsMasterObj[];
	locationMaster: LocationMasterObj[];
	beneficiariesMaster: BeneficiariesMasterObj[];
	allocationTypeMaster: AllocationTypeMasterObj[];
	allocationSourcesMaster: AllocationSourcesMasterObj[];
	partnerTypesMaster: PartnerTypesMasterObj[];
	sectorsMaster: SectorsMasterObj[];
};
