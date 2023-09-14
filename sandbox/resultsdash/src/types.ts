/* eslint-disable @typescript-eslint/no-unused-vars */

type Beneficiaries = number | null;

type BySectorObj = {
	PooledFundId: number;
	AllocationYear: number;
	ReportApprovedDate: Date;
	AllocationtypeId: number;
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

type LocationObj = {
	[key: number]: number[];
};

type List = {
	fundNames: ListObj;
	fundAbbreviatedNames: ListObj;
	fundIsoCodes: ListObj;
	locations: LocationObj;
	beneficiaryTypes: ListObj;
	allocationTypes: ListObj;
	allocationSources: ListObj;
	partnerTypes: ListObj;
	sectors: ListObj;
};

type RawData = {
	bySector: BySectorYear;
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

type BySectorYear = GenericYear<BySectorObj>;

type ByDisabilityYear = GenericYear<ByDisabilityObj>;

type ByLocationYear = GenericYear<ByLocationObj>;

type ByTypeYear = GenericYear<ByTypeObj>;

type PreProcessDataParams = {
	bySector: BySectorObj[];
	byDisability: ByDisabilityObj[];
	byLocation: ByLocationObj[];
	byType: ByTypeObj[];
	setInDataLists: React.Dispatch<React.SetStateAction<InDataLists | null>>;
};

type PreProcessDataReturn = {
	bySectorYear: BySectorYear;
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
	setYear: React.Dispatch<React.SetStateAction<number[] | null>>;
};

type SummaryChartProps = {
	dataSummary: SummaryData[];
	year: number[] | null;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
};

type SelectorsProps = {
	fund: number[];
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	allocationType: number[];
	setAllocationType: React.Dispatch<React.SetStateAction<number[]>>;
	allocationSource: number[];
	setAllocationSource: React.Dispatch<React.SetStateAction<number[]>>;
	inSelectionData: InSelectionObject;
};

type AccordionComponentProps = {
	type: string;
	filterType: string;
	dataProperty: DataProperties;
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	expanded: string | false;
	handleAccordionExpand: (
		panel: string
	) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
	inSelectionData: InSelectionObject;
};

type DropdownProps = {
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	names: number[];
	namesList: ListObj;
	type: string;
	inSelectionData: InSelectionObject;
	dataProperty: DataProperties;
	fromQuickSelectors: boolean;
};

type SearchProps = {
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	names: number[];
	namesList: ListObj;
	inSelectionData: InSelectionObject;
	dataProperty: DataProperties;
};

type CheckboxProps = {
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	names: number[];
	namesList: ListObj;
	inSelectionData: InSelectionObject;
	dataProperty: DataProperties;
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
	year,
}: {
	rawData: RawData;
	reportYear: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	year: number[] | null;
}) => {
	dataSummary: SummaryData[];
	dataPictogram: PictogramData;
	inSelectionData: InSelectionObject;
};

type ProcessDataBeneficiaryType = ({
	rawData,
	reportYear,
	fund,
	allocationSource,
	allocationType,
	year,
}: {
	rawData: RawData;
	reportYear: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	year: number[] | null;
}) => BeneficiaryTypeData[];

type BeneficiaryTypeData = {
	beneficiaryType: number;
	targeted: number;
	reached: number;
};

type ProcessDataSectors = ({
	rawData,
	reportYear,
	fund,
	allocationSource,
	allocationType,
	year,
}: {
	rawData: RawData;
	reportYear: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	year: number[] | null;
}) => SectorsData[];

type SectorsData = {
	sector: number;
	targeted: number;
	reached: number;
};

type InSelectionObject = {
	funds: Set<number>;
	allocationSources: Set<number>;
	allocationTypes: Set<number>;
};

type DataProperties = keyof InSelectionObject;

type TopChartProps = {
	year: number[] | null;
	dataSummary: SummaryData[];
	setYear: React.Dispatch<React.SetStateAction<number[] | null>>;
	reportYear: number[];
};

type ChartValue = "allocations" | "projects" | "partners";

type CreateTopChartParams = {
	height: number;
	dataSummary: SummaryData[];
	chartValue: ChartValue;
	svgContainer: React.RefObject<SVGSVGElement>;
	year: number[] | null;
	setYear: React.Dispatch<React.SetStateAction<number[] | null>>;
};

type PictogramData = {
	targetedMen: number;
	targetedWomen: number;
	targetedBoys: number;
	targetedGirls: number;
	reachedMen: number;
	reachedWomen: number;
	reachedBoys: number;
	reachedGirls: number;
};

type PictogramChartProps = {
	dataPictogram: PictogramData;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
};

type PictogramTypes = "girls" | "boys" | "women" | "men";

type PictogramTypesWithTotal = PictogramTypes | "total";

type DownloadIconProps = {
	handleDownloadClick: () => void;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	type: Charts;
};

type DownloadStates = {
	summary: boolean;
	pictogram: boolean;
	beneficiaryTypes: boolean;
	sectors: boolean;
};

type Charts = "summary" | "pictogram" | "beneficiaryTypes" | "sectors";

type PictogramRowProps = {
	type: PictogramTypes;
	targeted: number;
	reached: number;
	maxNumberOfPictograms: number;
	maxValue: number;
};

type TypesAndSectorChartProps = {
	data: BeneficiaryTypeData[] | SectorsData[];
	list: ListObj;
	clickedDownload: DownloadStates;
	title: string;
	chartType: Charts;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
};

type TypeAndSectorRowProps = {
	type: number;
	targeted: number;
	reached: number;
	list: ListObj;
	maxValue: number;
};

type DownloadData = <T extends object>(data: T[], fileName: string) => void;
