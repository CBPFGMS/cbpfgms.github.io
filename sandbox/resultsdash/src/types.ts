/* eslint-disable @typescript-eslint/no-unused-vars */

type Beneficiaries = number | null;

export type ReceiveDataArgs = [
	BySectorObj[],
	ByDisabilityObj[],
	ByLocationObj[],
	ByTypeObj[],
	ByOrganizationObj[],
	LocationMasterObj[],
	BeneficiariesMasterObj[],
	AllocationTypeMasterObj[],
	FundsMasterObj[],
	AllocationSourcesMasterObj[],
	OrganizationTypesMasterObj[],
	SectorsMasterObj[],
	ApprovedAllocationsObj[]
];

import { ApprovedAllocationsObj } from "./schemas";

import { BySectorObj } from "./schemas";

import { ByDisabilityObj } from "./schemas";

import { ByLocationObj } from "./schemas";

import { ByTypeObj } from "./schemas";

import { ByOrganizationObj } from "./schemas";

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

type OrganizationTypesMasterObj = {
	id: number;
	OrganizationTypeName: string;
};

type SectorsMasterObj = {
	id: number;
	ClustNm: string;
	ClustCode: string;
};

export type ListObj = {
	[key: number]: string;
};

export type ReversedNames = {
	[key: string]: number;
};

type LocationObj = {
	[key: number]: {
		coordinates: number[];
		locationName: string;
	};
};

export type List = {
	fundNames: ListObj;
	fundAbbreviatedNames: ListObj;
	fundIsoCodes: ListObj;
	locations: LocationObj;
	beneficiaryTypes: ListObj;
	allocationTypes: ListObj;
	allocationSources: ListObj;
	organizationTypes: ListObj;
	sectors: ListObj;
};

export type RawData = {
	bySector: BySectorYear;
	byDisability: ByDisabilityYear;
	byLocation: ByLocationYear;
	byType: ByTypeYear;
	byOrganization: ByOrganizationYear;
	approved: ApprovedAllocationsObj[];
	allocatedTotals: ByDisabilityYear;
};

export type MakeListParams = {
	fundsMaster: FundsMasterObj[];
	locationMaster: LocationMasterObj[];
	beneficiariesMaster: BeneficiariesMasterObj[];
	allocationTypeMaster: AllocationTypeMasterObj[];
	allocationSourcesMaster: AllocationSourcesMasterObj[];
	organizationTypesMaster: OrganizationTypesMasterObj[];
	sectorsMaster: SectorsMasterObj[];
};

export type InDataLists = {
	reportYears: Set<number>;
	sectors: Set<number>;
	allocationTypes: Set<number>;
	allocationSources: Set<number>;
	beneficiaryTypes: Set<number>;
	funds: Set<number>;
	organizationTypes: Set<number>;
};

export type GenericYear<TObj> = {
	year: number;
	values: TObj[];
}[];

export type BySectorYear = GenericYear<BySectorObj>;

export type ByDisabilityYear = GenericYear<ByDisabilityObj>;

export type ByLocationYear = GenericYear<ByLocationObj>;

export type ByTypeYear = GenericYear<ByTypeObj>;

export type ByOrganizationYear = GenericYear<ByOrganizationObj>;

export type ApprovedSummary = {
	year: number;
	approved: number;
	underApproval: number;
};

export type PreProcessDataParams = {
	bySector: BySectorObj[];
	byDisability: ByDisabilityObj[];
	byLocation: ByLocationObj[];
	byType: ByTypeObj[];
	byOrganization: ByOrganizationObj[];
	setInDataLists: React.Dispatch<React.SetStateAction<InDataLists | null>>;
};

export type AllocatedTotals = {
	[key: string]: number;
};

export type PreProcessDataReturn = {
	bySectorYear: BySectorYear;
	byDisabilityYear: ByDisabilityYear;
	byLocationYear: ByLocationYear;
	byTypeYear: ByTypeYear;
	byOrganizationYear: ByOrganizationYear;
	allocatedTotals: ByDisabilityYear;
};

export type DataContextType = {
	rawData: RawData;
	lists: List;
	inDataLists: InDataLists;
};

export type YearSelectorProps = {
	reportYear: number[];
	setReportYear: React.Dispatch<React.SetStateAction<number[]>>;
	reportYears: Set<number>;
	setYear: React.Dispatch<React.SetStateAction<number[] | null>>;
};

export type SummaryChartProps = {
	dataSummary: SummaryData[];
	year: number[] | null;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	summaryDataDownload: ByDisabilityObj[];
	fundsList: ListObj;
};

export type SelectorsProps = {
	fund: number[];
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	allocationType: number[];
	setAllocationType: React.Dispatch<React.SetStateAction<number[]>>;
	allocationSource: number[];
	setAllocationSource: React.Dispatch<React.SetStateAction<number[]>>;
	inSelectionData: InSelectionObject;
};

export type AccordionComponentProps = {
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

export type DropdownProps = {
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	names: number[];
	namesList: ListObj;
	type: string;
	inSelectionData: InSelectionObject;
	dataProperty: DataProperties;
	fromQuickSelectors: boolean;
};

export type SearchProps = {
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	names: number[];
	namesList: ListObj;
	inSelectionData: InSelectionObject;
	dataProperty: DataProperties;
};

export type CheckboxProps = {
	value: number[];
	setValue: React.Dispatch<React.SetStateAction<number[]>>;
	names: number[];
	namesList: ListObj;
	inSelectionData: InSelectionObject;
	dataProperty: DataProperties;
};

export type SummaryData = {
	year: number;
	allocations: number;
	projects: number;
	partners: number;
};

export type SummaryRowProps = SummaryData & {
	last: boolean;
};

export type ProcessDataSummary = ({
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
	approvedSummary: ApprovedSummary[];
	allocatedTotals: AllocatedTotals;
};

type DataPropertyAccessor =
	| "BeneficiaryTypeId"
	| "ClusterId"
	| "OrganizationType";

export type ProcessData = <
	T extends ByTypeYear | BySectorYear | ByOrganizationYear
>({
	originalData,
	reportYear,
	fund,
	allocationSource,
	allocationType,
	year,
	dataProperty,
}: {
	originalData: T;
	reportYear: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	year: number[] | null;
	dataProperty: DataPropertyAccessor;
}) => TypeData[];

export type TypeData = {
	type: number;
	targeted: number;
	reached: number;
};

export type ProcessDataMap = ({
	rawData,
	reportYear,
	fund,
	allocationSource,
	allocationType,
	year,
	locationsList,
}: {
	rawData: RawData;
	reportYear: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	year: number[] | null;
	locationsList: LocationObj;
}) => MapData[];

export type MapData = {
	locationId: number;
	locationName: string;
	coordinates: number[];
	beneficiaries: PictogramData;
};

export type InSelectionObject = {
	funds: Set<number>;
	allocationSources: Set<number>;
	allocationTypes: Set<number>;
};

type DataProperties = keyof InSelectionObject;

export type TopChartProps = {
	year: number[] | null;
	dataSummary: SummaryData[];
	setYear: React.Dispatch<React.SetStateAction<number[] | null>>;
	reportYear: number[];
	approvedData: ApprovedSummary[];
	allocatedTotals: AllocatedTotals;
};

export type ChartValue = "allocations" | "projects" | "partners";

export type CreateTopChartParams = {
	height: number;
	dataSummary: SummaryData[];
	chartValue: ChartValue;
	svgContainer: React.RefObject<SVGSVGElement>;
	year: number[] | null;
	setYear: React.Dispatch<React.SetStateAction<number[] | null>>;
};

export type CreateDonutParams = {
	size: number;
	svgContainer: React.RefObject<SVGSVGElement>;
	donutData: DonutData;
	colorScale: d3.ScaleOrdinal<DonutTypes, string>;
	reportYear: number[];
};

export type PictogramData = {
	targetedMen: number;
	targetedWomen: number;
	targetedBoys: number;
	targetedGirls: number;
	reachedMen: number;
	reachedWomen: number;
	reachedBoys: number;
	reachedGirls: number;
};

export type PictogramChartProps = {
	dataPictogram: PictogramData;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	summaryDataDownload: ByDisabilityObj[];
	fundsList: ListObj;
};

export type PictogramTypes = "girls" | "boys" | "women" | "men";

export type PictogramTypesWithTotal = PictogramTypes | "total";

export type DownloadIconProps = {
	handleDownloadClick: () => void;
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	type: Charts;
};

export type DownloadStates = {
	[K in Charts]: boolean;
};

type Charts =
	| "summary"
	| "pictogram"
	| "beneficiaryTypes"
	| "sectors"
	| "map"
	| "organization";

export type PictogramRowProps = {
	type: PictogramTypes;
	targeted: number;
	reached: number;
	maxNumberOfPictograms: number;
	maxValue: number;
};

export type TypesAndSectorChartProps<DownloadType> = {
	data: TypeData[];
	list: List;
	clickedDownload: DownloadStates;
	title: string;
	chartType: Charts;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	dataDownload: DownloadType[];
};

export type DownloadType = ByTypeObj | BySectorObj;

export type TypeAndSectorRowProps = {
	type: number;
	targeted: number;
	reached: number;
	list: ListObj;
	maxValue: number;
	chartType: Charts;
};

export type DownloadData = <T extends object>(
	data: T[],
	fileName: string
) => void;

export type SnackProps = {
	openSnack: boolean;
	setOpenSnack: React.Dispatch<React.SetStateAction<boolean>>;
	message: string;
};

export type MapProps = {
	data: MapData[];
	clickedDownload: DownloadStates;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
};

export type CreateMapParams = {
	data: MapData[];
	svgGroupRef: React.RefObject<SVGGElement>;
	maxCircleRadius: number;
	maxValue: number;
	minCircleRadius: number;
};

export type SVGOverlayComponentProps = {
	data: MapData[];
	maxZoomValue: number;
	maxValue: number;
	maxCircleRadius: number;
	minCircleRadius: number;
};

export type CreateSizeLegendParams = {
	svgRef: SVGSVGElement;
	maxValue: number;
	minValue: number;
	legendSvgWidth: number;
	legendSvgHeight: number;
	maxCircleRadius: number;
	minCircleRadius: number;
};

export type CreateColorLegendParams = {
	svgRef: SVGSVGElement;
	legendSvgWidth: number;
	legendSvgHeight: number;
};

type TFilterObj = BySectorObj | ByDisabilityObj | ByTypeObj | ByOrganizationObj;

export type FilterDownloadArray = <TFObj extends TFilterObj>(
	arr: GenericYear<TFObj>,
	reportYear: number[],
	fund: number[],
	allocationSource: number[],
	allocationType: number[]
) => TFObj[];

export type ApprovedChartProps = {
	approvedData: ApprovedSummary[];
	year: number[];
	dataSummary: SummaryData[];
	reportYear: number[];
	allocatedTotals: AllocatedTotals;
};

export type DonutDatum = {
	type: DonutTypes;
	value: number;
};

export type DonutData = DonutDatum[];

export type DonutTypes = "selected" | "allocated" | "underImplementation";

export type ArcObject = {
	startAngle: number;
	endAngle: number;
};

export type ScrollSpyProps = {
	inViewSummary: boolean;
	inViewPictogram: boolean;
	inViewBeneficiaryTypes: boolean;
	inViewOrganizationTypes: boolean;
	inViewSectors: boolean;
	inViewMap: boolean;
	summaryRef: string;
	pictogramRef: string;
	beneficiaryTypesRef: string;
	organizationTypesRef: string;
	sectorsRef: string;
	mapRef: string;
};

export type TabProps = {
	label: string;
	inView: boolean;
	reference: string;
	handleOnClick: (reference: string) => void;
	Icon: React.ElementType;
};
