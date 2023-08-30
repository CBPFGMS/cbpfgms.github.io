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
	TotalNumbPartners: number;
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
	AllocationtypeId: number;
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

type locationObj = {
	[key: number]: number[];
};

type List = {
	[key: string]: ListObj | locationObj;
};

type RawData = {
	byCluster: ByClusterYear;
	byDisability: ByDisabilityYear;
	byLocation: ByLocationYear;
	byType: ByTypeYear;
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

type InDataLists = {
	reportYears: Set<number>;
	sectors: Set<number>;
	allocationTypes: Set<number>;
	allocationSources: Set<number>;
	beneficiaryTypes: Set<number>;
	funds: Set<number>;
};

type GenericYear<TObj> = {
	year: number;
	values: TObj[];
}[];

type ByClusterYear = GenericYear<ByClusterObj>;

type ByDisabilityYear = GenericYear<ByDisabilityObj>;

type ByLocationYear = GenericYear<ByLocationObj>;

type ByTypeYear = GenericYear<ByTypeObj>;

type PreProcessDataParams = {
	byCluster: ByClusterObj[];
	byDisability: ByDisabilityObj[];
	byLocation: ByLocationObj[];
	byType: ByTypeObj[];
	setInDataLists: React.Dispatch<React.SetStateAction<InDataLists | null>>;
};

type PreProcessDataReturn = {
	byClusterYear: ByClusterYear;
	byDisabilityYear: ByDisabilityYear;
	byLocationYear: ByLocationYear;
	byTypeYear: ByTypeYear;
};

type DataContext = {
	rawData: RawData;
	lists: List;
	inDataLists: InDataLists;
};

type SelectionContext = {
	reportYear: number[];
	setReportYear: React.Dispatch<React.SetStateAction<number[]>>;
	year: number[] | null;
	setYear: React.Dispatch<React.SetStateAction<number[] | null>>;
	allocationType: number[];
	setAllocationType: React.Dispatch<React.SetStateAction<number[]>>;
	fund: number[];
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	allocationSource: number[];
	setAllocationSource: React.Dispatch<React.SetStateAction<number[]>>;
	beneficiaryType: number[];
	setBeneficiaryType: React.Dispatch<React.SetStateAction<number[]>>;
};

type YearSelectorProps = {
	reportYear: number[];
	setReportYear: React.Dispatch<React.SetStateAction<number[]>>;
	reportYears: Set<number>;
};

type SummaryChartProps = {
	dataSummary: SummaryData[];
	year: number[] | null;
};

type SelectorsProps = {
	fund: number[];
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	allocationType: number[];
	setAllocationType: React.Dispatch<React.SetStateAction<number[]>>;
	allocationSource: number[];
	setAllocationSource: React.Dispatch<React.SetStateAction<number[]>>;
};

type AccordionComponentProps = {
	type: string;
	filterType: string;
	dataProperty: string;
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	expanded: string | false;
	handleAccordionExpand: (
		panel: string
	) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
};

type DropdownProps = {
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	names: number[];
	namesList: ListObj;
	type: string;
};

type CheckboxProps = {
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	names: number[];
	namesList: ListObj;
};

type SummaryData = {
	year: number;
	allocations: number;
	projects: number;
	partners: number;
};

type SummaryRowProps = SummaryData & {
	last: boolean;
};

type processDataSummary = ({
	rawData,
	reportYear,
	fund,
	allocationSource,
	allocationType,
}: {
	rawData: RawData;
	reportYear: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
}) => SummaryData[];

type TopChartProps = {
	year: number[] | null;
	dataSummary: SummaryData[];
	setYear: React.Dispatch<React.SetStateAction<number[] | null>>;
};

type ChartValue = "allocations" | "projects" | "partners";
