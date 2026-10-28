import { useEffect, useState } from "react"; //REMOVE LATER
import fetchFile from "./fetchfile";
import fetchFileDB from "./fetchfiledb";
import makeLists, { List } from "./makelists";
import processRawData, {
	Data,
	InDataLists,
	TotalBeneficiariesByPartnerData,
	TotalBeneficiariesBySectorData,
	TotalBeneficiariesData,
	TotalBeneficiariesByBeneficiaryTypeData,
} from "./processrawdata";
import {
	AllocationSourcesMasterObject,
	AllocationTypesMasterObject,
	BeneficiaryTypesMasterObject,
	OrganizationMasterObject,
	OrganizationTypesMasterObject,
	PooledFundsMasterObject,
	ProjectSummaryObject,
	SectorBeneficiaryObject,
	SectorsMasterObject,
	GlobalIndicatorsMasterObject,
	GlobalIndicatorsObject,
	EmergenciesMasterObject,
	EmergenciesObject,
	CvaObject,
	CvaMasterObject,
	TotalBeneficiariesObject,
	TotalBeneficiariesByPartnerObject,
	TotalBeneficiariesBySectorObject,
	TotalBeneficiariesByBeneficiaryTypeObject,
} from "./schemas";
import trackProgress from "./trackprogress";

export type UseDataReturn = {
	data: Data;
	dataIndicators: GlobalIndicatorsObject[];
	lists: List;
	inDataLists: InDataLists;
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	totalBeneficiariesByBeneficiaryTypeData: TotalBeneficiariesByBeneficiaryTypeData;
	totalBeneficiariesByDisabilityData: TotalBeneficiariesData;
	totalBeneficiariesWithAllocTypeData: TotalBeneficiariesData;
	totalBeneficiariesByPartnerWithAllocTypeData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorWithAllocTypeData: TotalBeneficiariesBySectorData;
	totalBeneficiariesByBeneficiaryTypeWithAllocTypeData: TotalBeneficiariesByBeneficiaryTypeData;
	totalBeneficiariesByDisabilityWithAllocTypeData: TotalBeneficiariesData;
	loading: boolean;
	error: string | null;
	progress: number;
	totalFiles: number;
};

type ReceiveDataArgs = [
	ProjectSummaryObject[],
	SectorBeneficiaryObject[],
	GlobalIndicatorsObject[],
	EmergenciesObject[],
	CvaObject[],
	AllocationTypesMasterObject[],
	OrganizationMasterObject[],
	BeneficiaryTypesMasterObject[],
	PooledFundsMasterObject[],
	AllocationSourcesMasterObject[],
	OrganizationTypesMasterObject[],
	SectorsMasterObject[],
	GlobalIndicatorsMasterObject[],
	EmergenciesMasterObject[],
	CvaMasterObject[],
	TotalBeneficiariesObject[],
	TotalBeneficiariesByPartnerObject[],
	TotalBeneficiariesBySectorObject[],
	TotalBeneficiariesByBeneficiaryTypeObject[],
	TotalBeneficiariesObject[],
	TotalBeneficiariesObject[],
	TotalBeneficiariesByPartnerObject[],
	TotalBeneficiariesBySectorObject[],
	TotalBeneficiariesByBeneficiaryTypeObject[],
	TotalBeneficiariesObject[],
];

//true: production API, false: staging API
const isProdApi = true;

const prodApiUrl = "https://pfbi-eastus2-api-site.azurewebsites.net/",
	stagingApiUrl = "https://pfbi-eastus2-api-site-api-dev.azurewebsites.net/",
	bdtApiBaseUrl = isProdApi ? prodApiUrl : stagingApiUrl;

const beneficiaryTypesMasterUrl =
		"https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=BENEF_TYPE_MST",
	pooledFundsMasterUrl =
		"https://cbpfapi.unocha.org/vo2/odata/MstPooledFund?$format=csv",
	allocationSourcesMasterUrl =
		"https://cbpfapi.unocha.org/vo2/odata/MstAllocationSource?$format=csv",
	organizationTypesMasterUrl =
		"https://cbpfapi.unocha.org/vo2/odata/MstOrgType?$format=csv",
	sectorsMasterUrl =
		"https://cbpfapi.unocha.org/vo2/odata/MstClusters?$format=csv",
	globalIndicatorsMasterUrl =
		"https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=GLB_INDIC_MST&GlobalIndicatorType=&$format=csv",
	emergenciesMasterUrl =
		"https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=EMERG_TYPE_MST&$format=csv",
	cvaMasterUrl =
		"https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=MstCVAType",
	totalBeneficiariesUrl = `${bdtApiBaseUrl}bdt2/api/public/v1/beneficiary/?$format=csv`,
	totalBeneficiariesByPartnerUrl = `${bdtApiBaseUrl}bdt2/api/public/v1/beneficiaryByPartnerType/?$format=csv`,
	totalBeneficiariesBySectorUrl = `${bdtApiBaseUrl}bdt2/api/public/v1/beneficiaryByCluster/?$format=csv`,
	totalBeneficiariesByBeneficiaryTypeUrl = `${bdtApiBaseUrl}bdt2/api/public/v1/beneficiaryByBenType/?$format=csv`,
	totalBeneficiariesByDisabilityUrl = `${bdtApiBaseUrl}bdt2/api/public/v1/beneficiaryByDisabilities/?$format=csv`,
	totalBeneficiariesWithAllocTypeUrl = `${bdtApiBaseUrl}bdt2/api/public/v1/beneficiary/?only_allocation=1&$format=csv`,
	totalBeneficiariesByPartnerWithAllocTypeUrl = `${bdtApiBaseUrl}bdt2/api/public/v1/beneficiaryByPartnerType/?only_allocation=1&$format=csv`,
	totalBeneficiariesBySectorWithAllocTypeUrl = `${bdtApiBaseUrl}bdt2/api/public/v1/beneficiaryByCluster/?only_allocation=1&$format=csv`,
	totalBeneficiariesByBeneficiaryTypeWithAllocTypeUrl = `${bdtApiBaseUrl}bdt2/api/public/v1/beneficiaryByBenType/?only_allocation=1&$format=csv`,
	totalBeneficiariesByDisabilityWithAllocTypeUrl = `${bdtApiBaseUrl}bdt2/api/public/v1/beneficiaryByDisabilities/?only_allocation=1&$format=csv`;

function useData(
	defaultFundType: number | null,
	startYear: number | null,
): UseDataReturn {
	const fundType = defaultFundType ? defaultFundType : "",
		yearRange = startYear ? `${startYear}_${new Date().getFullYear()}` : "";

	const projectSummaryUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_PROJ_SUMMARY_V4&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${fundType}&$format=csv`,
		sectorsDataUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_RPT_CLST_BENEF&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${fundType}&$format=csv`,
		globalIndicatorsUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_GLB_INDIC&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=&IndicatorTypeId=&FundTypeId=${fundType}&$format=csv`,
		emergenciesDataUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PROJECT_EMERGENCY_OneGMS&PoolfundCodeAbbrv=&AllocationYear=&FundTypeId=${fundType}&$format=csv`,
		allocationTypesMasterUrl = `https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&AllocationYear=${yearRange}&$format=csv`,
		organizationMasterUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_ORG_SUMMARY&PoolfundCodeAbbrv=&FundTypeId=${fundType}&$format=csv`,
		cvaDataUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=APIDAT_CVA&PoolfundCodeAbbrv=&AllocationYear=&FundTypeId=${fundType}&$format=csv`;

	const [data, setData] = useState<Data>([] as Data),
		[dataIndicators, setDataIndicators] = useState<
			GlobalIndicatorsObject[]
		>([] as GlobalIndicatorsObject[]),
		[lists, setLists] = useState<List>({} as List),
		[inDataLists, setInDataLists] = useState<InDataLists>(
			{} as InDataLists,
		);
	const [loading, setLoading] = useState<boolean>(true),
		[error, setError] = useState<string | null>(null);

	const [totalBeneficiariesData, setTotalBeneficiariesData] =
		useState<TotalBeneficiariesData>([] as TotalBeneficiariesData);
	const [
		totalBeneficiariesByPartnerData,
		setTotalBeneficiariesByPartnerData,
	] = useState<TotalBeneficiariesByPartnerData>(
		[] as TotalBeneficiariesByPartnerData,
	);
	const [totalBeneficiariesBySectorData, setTotalBeneficiariesBySectorData] =
		useState<TotalBeneficiariesBySectorData>(
			[] as TotalBeneficiariesBySectorData,
		);
	const [
		totalBeneficiariesByBeneficiaryTypeData,
		setTotalBeneficiariesByBeneficiaryTypeData,
	] = useState<TotalBeneficiariesByBeneficiaryTypeData>(
		[] as TotalBeneficiariesByBeneficiaryTypeData,
	);
	const [
		totalBeneficiariesByDisabilityData,
		setTotalBeneficiariesByDisabilityData,
	] = useState<TotalBeneficiariesData>([] as TotalBeneficiariesData);
	const [
		totalBeneficiariesWithAllocTypeData,
		setTotalBeneficiariesWithAllocTypeData,
	] = useState<TotalBeneficiariesData>([] as TotalBeneficiariesData);
	const [
		totalBeneficiariesByPartnerWithAllocTypeData,
		setTotalBeneficiariesByPartnerWithAllocTypeData,
	] = useState<TotalBeneficiariesByPartnerData>(
		[] as TotalBeneficiariesByPartnerData,
	);
	const [
		totalBeneficiariesBySectorWithAllocTypeData,
		setTotalBeneficiariesBySectorWithAllocTypeData,
	] = useState<TotalBeneficiariesBySectorData>(
		[] as TotalBeneficiariesBySectorData,
	);
	const [
		totalBeneficiariesByBeneficiaryTypeWithAllocTypeData,
		setTotalBeneficiariesByBeneficiaryTypeWithAllocTypeData,
	] = useState<TotalBeneficiariesByBeneficiaryTypeData>(
		[] as TotalBeneficiariesByBeneficiaryTypeData,
	);
	const [
		totalBeneficiariesByDisabilityWithAllocTypeData,
		setTotalBeneficiariesByDisabilityWithAllocTypeData,
	] = useState<TotalBeneficiariesData>([] as TotalBeneficiariesData);

	const [progress, setProgress] = useState<number>(0);
	const [totalFiles, setTotalFiles] = useState<number>(0);

	useEffect(() => {
		const fetchPromises = [
			trackProgress(
				fetchFileDB<ProjectSummaryObject[]>(
					"projectSummary",
					projectSummaryUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFileDB<SectorBeneficiaryObject[]>(
					"sectorsData",
					sectorsDataUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFileDB<GlobalIndicatorsObject[]>(
					"globalIndicators",
					globalIndicatorsUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFileDB<EmergenciesObject[]>(
					"emergenciesData",
					emergenciesDataUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFileDB<CvaObject[]>("CVAData", cvaDataUrl, "csv"),
				setProgress,
			),
			trackProgress(
				fetchFile<AllocationTypesMasterObject[]>(
					"allocationTypesMaster",
					allocationTypesMasterUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFile<OrganizationMasterObject[]>(
					"organizationMaster",
					organizationMasterUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFile<BeneficiaryTypesMasterObject[]>(
					"beneficiaryTypesMaster",
					beneficiaryTypesMasterUrl,
					"json",
				),
				setProgress,
			),
			trackProgress(
				fetchFile<PooledFundsMasterObject[]>(
					"pooledFundsMaster",
					pooledFundsMasterUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFile<AllocationSourcesMasterObject[]>(
					"allocationSourcesMaster",
					allocationSourcesMasterUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFile<OrganizationTypesMasterObject[]>(
					"organizationTypesMaster",
					organizationTypesMasterUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFile<SectorsMasterObject[]>(
					"sectorsMaster",
					sectorsMasterUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFile<GlobalIndicatorsMasterObject[]>(
					"globalIndicatorsMaster",
					globalIndicatorsMasterUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFile<EmergenciesMasterObject[]>(
					"emergenciesMaster",
					emergenciesMasterUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFile<CvaMasterObject[]>("cvaMaster", cvaMasterUrl, "json"),
				setProgress,
			),
			trackProgress(
				fetchFileDB<TotalBeneficiariesObject[]>(
					"totalBeneficiaries",
					totalBeneficiariesUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFileDB<TotalBeneficiariesByPartnerObject[]>(
					"totalBeneficiariesByPartner",
					totalBeneficiariesByPartnerUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFileDB<TotalBeneficiariesBySectorObject[]>(
					"totalBeneficiariesBySector",
					totalBeneficiariesBySectorUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFileDB<TotalBeneficiariesByBeneficiaryTypeObject[]>(
					"totalBeneficiariesByBeneficiaryType",
					totalBeneficiariesByBeneficiaryTypeUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFileDB<TotalBeneficiariesObject[]>(
					"totalBeneficiariesByDisability",
					totalBeneficiariesByDisabilityUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFileDB<TotalBeneficiariesObject[]>(
					"totalBeneficiariesWithAllocType",
					totalBeneficiariesWithAllocTypeUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFileDB<TotalBeneficiariesByPartnerObject[]>(
					"totalBeneficiariesByPartnerWithAllocType",
					totalBeneficiariesByPartnerWithAllocTypeUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFileDB<TotalBeneficiariesBySectorObject[]>(
					"totalBeneficiariesBySectorWithAllocType",
					totalBeneficiariesBySectorWithAllocTypeUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFileDB<TotalBeneficiariesByBeneficiaryTypeObject[]>(
					"totalBeneficiariesByBeneficiaryTypeWithAllocType",
					totalBeneficiariesByBeneficiaryTypeWithAllocTypeUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFileDB<TotalBeneficiariesObject[]>(
					"totalBeneficiariesByDisabilityWithAllocType",
					totalBeneficiariesByDisabilityWithAllocTypeUrl,
					"csv",
				),
				setProgress,
			),
		] as const;

		setTotalFiles(fetchPromises.length);

		Promise.all(fetchPromises)
			.then(receiveData)
			.catch((error: unknown) => {
				if (error instanceof Error) {
					setError(error.message);
				} else {
					setError("An unknown error occurred");
				}
				setLoading(false);
			});

		function receiveData([
			projectSummary,
			sectorsData,
			globalIndicatorsData,
			emergenciesData,
			cvaData,
			allocationTypesMaster,
			organizationMaster,
			beneficiaryTypesMaster,
			pooledFundsMaster,
			allocationSourcesMaster,
			organizationTypesMaster,
			sectorsMaster,
			globalIndicatorsMaster,
			emergenciesMaster,
			cvaMaster,
			totalBeneficiaries,
			totalBeneficiariesByPartner,
			totalBeneficiariesBySector,
			totalBeneficiariesByBeneficiaryType,
			totalBeneficiariesByDisability,
			totalBeneficiariesWithAllocType,
			totalBeneficiariesByPartnerWithAllocType,
			totalBeneficiariesBySectorWithAllocType,
			totalBeneficiariesByBeneficiaryTypeWithAllocType,
			totalBeneficiariesByDisabilityWithAllocType,
		]: ReceiveDataArgs): void {
			const listsObj: List = makeLists({
				allocationTypesMaster,
				organizationMaster,
				beneficiaryTypesMaster,
				pooledFundsMaster,
				allocationSourcesMaster,
				organizationTypesMaster,
				sectorsMaster,
				globalIndicatorsMaster,
				emergenciesMaster,
				cvaMaster,
			});

			const {
				data,
				totalBeneficiariesData,
				totalBeneficiariesByPartnerData,
				totalBeneficiariesBySectorData,
				totalBeneficiariesByBeneficiaryTypeData,
				totalBeneficiariesByDisabilityData,
				totalBeneficiariesWithAllocTypeData,
				totalBeneficiariesByPartnerWithAllocTypeData,
				totalBeneficiariesBySectorWithAllocTypeData,
				totalBeneficiariesByBeneficiaryTypeWithAllocTypeData,
				totalBeneficiariesByDisabilityWithAllocTypeData,
			} = processRawData({
				projectSummary,
				sectorsData,
				emergenciesData,
				cvaData,
				listsObj,
				setInDataLists,
				totalBeneficiaries,
				totalBeneficiariesByPartner,
				totalBeneficiariesBySector,
				totalBeneficiariesByBeneficiaryType,
				totalBeneficiariesByDisability,
				totalBeneficiariesWithAllocType,
				totalBeneficiariesByPartnerWithAllocType,
				totalBeneficiariesBySectorWithAllocType,
				totalBeneficiariesByBeneficiaryTypeWithAllocType,
				totalBeneficiariesByDisabilityWithAllocType,
			});

			setData(data);
			setDataIndicators(globalIndicatorsData);
			setLists(listsObj);
			setLoading(false);
			setTotalBeneficiariesData(totalBeneficiariesData);
			setTotalBeneficiariesByPartnerData(totalBeneficiariesByPartnerData);
			setTotalBeneficiariesBySectorData(totalBeneficiariesBySectorData);
			setTotalBeneficiariesByBeneficiaryTypeData(
				totalBeneficiariesByBeneficiaryTypeData,
			);
			setTotalBeneficiariesByDisabilityData(
				totalBeneficiariesByDisabilityData,
			);
			setTotalBeneficiariesWithAllocTypeData(
				totalBeneficiariesWithAllocTypeData,
			);
			setTotalBeneficiariesByPartnerWithAllocTypeData(
				totalBeneficiariesByPartnerWithAllocTypeData,
			);
			setTotalBeneficiariesBySectorWithAllocTypeData(
				totalBeneficiariesBySectorWithAllocTypeData,
			);
			setTotalBeneficiariesByBeneficiaryTypeWithAllocTypeData(
				totalBeneficiariesByBeneficiaryTypeWithAllocTypeData,
			);
			setTotalBeneficiariesByDisabilityWithAllocTypeData(
				totalBeneficiariesByDisabilityWithAllocTypeData,
			);
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		data,
		dataIndicators,
		lists,
		inDataLists,
		loading,
		error,
		progress,
		totalFiles,
		totalBeneficiariesData,
		totalBeneficiariesByPartnerData,
		totalBeneficiariesBySectorData,
		totalBeneficiariesByBeneficiaryTypeData,
		totalBeneficiariesByDisabilityData,
		totalBeneficiariesWithAllocTypeData,
		totalBeneficiariesByPartnerWithAllocTypeData,
		totalBeneficiariesBySectorWithAllocTypeData,
		totalBeneficiariesByBeneficiaryTypeWithAllocTypeData,
		totalBeneficiariesByDisabilityWithAllocTypeData,
	};
}

export default useData;
