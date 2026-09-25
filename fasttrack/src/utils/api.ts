import { useEffect, useState } from "react";
import fetchFile from "./fetchfile";
import fetchFileDB from "./fetchfiledb";
import trackProgress from "./trackprogress";
import makeLists, { type List } from "./makelists";
import processRawData, {
	type Data,
	type InDataLists,
	type TotalBeneficiariesData,
} from "./processrawdata";
import type {
	AllocationSourcesMasterObject,
	AllocationTypesMasterObject,
	BeneficiaryTypesMasterObject,
	OrganizationMasterObject,
	OrganizationTypesMasterObject,
	PooledFundsMasterObject,
	PooledFundsWithRegionMasterObject,
	ProjectSummaryObject,
	SectorBeneficiaryObject,
	SectorsMasterObject,
	GlobalIndicatorsMasterObject,
	GlobalIndicatorsObject,
	TotalBeneficiariesObject,
	OrganizationIdsMapObject,
	TemplatesMasterJson,
	AllocationsLollipopObject,
} from "./schemas";
import { constants } from "./constants";

type ReceiveDataArgs = [
	ProjectSummaryObject[],
	SectorBeneficiaryObject[],
	GlobalIndicatorsObject[],
	AllocationTypesMasterObject[],
	OrganizationMasterObject[],
	AllocationsLollipopObject[],
	BeneficiaryTypesMasterObject[],
	PooledFundsMasterObject[],
	AllocationSourcesMasterObject[],
	OrganizationTypesMasterObject[],
	SectorsMasterObject[],
	GlobalIndicatorsMasterObject[],
	PooledFundsWithRegionMasterObject[],
	TotalBeneficiariesObject[],
	TotalBeneficiariesObject[],
	TotalBeneficiariesObject[],
	OrganizationIdsMapObject[],
	TemplatesMasterJson,
];

const { fundType } = constants;

const beneficiaryTypesMasterUrl =
		"https://cbpfgms.github.io/pfbi-data/cbpf/results/MstBeneficiaryType.csv",
	pooledFundsMasterUrl =
		"https://cbpfapi.unocha.org/vo2/odata/MstPooledFund?$format=csv",
	allocationSourcesMasterUrl =
		"https://cbpfapi.unocha.org/vo2/odata/MstAllocationSource?$format=csv",
	organizationTypesMasterUrl =
		"https://cbpfapi.unocha.org/vo2/odata/MstOrgType?$format=csv",
	sectorsMasterUrl =
		"https://cbpfapi.unocha.org/vo2/odata/MstClusters?$format=csv",
	globalIndicatorsMasterUrl =
		"https://cbpfapib.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=GLB_INDIC_MST&GlobalIndicatorType=&$format=csv",
	pooledFundWithRegionMasterUrl =
		"https://cbpfgms.github.io/pfbi-data/mst/MstCountry.json",
	totalBeneficiariesUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/beneficiary/?group_name=US_Tranche_2026&$format=csv",
	totalBeneficiariesTranche1Url =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/beneficiary/?group_name=US_Tranche1_2026&$format=csv",
	totalBeneficiariesTranche2Url =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/beneficiary/?group_name=US_Tranche2_2026&$format=csv",
	organizationIdsMapUrl =
		"https://raw.githubusercontent.com/CBPFGMS/cbpfgms-data/refs/heads/main/FT/organizationIdsMap.json",
	templatesMasterUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/templates/?includeProjectCode=1";

//fake data path on staging site: ./assets/stg-data/

function useData(
	defaultFundType: number | null,
	startYear: number | null,
): {
	data: Data;
	dataIndicators: GlobalIndicatorsObject[];
	lists: List;
	inDataLists: InDataLists;
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesTranche1Data: TotalBeneficiariesData;
	totalBeneficiariesTranche2Data: TotalBeneficiariesData;
	allocationsLollipopData: AllocationsLollipopObject[];
	loading: boolean;
	error: string | null;
	progress: number;
	totalFiles: number;
} {
	const selectedFundType = defaultFundType ? defaultFundType : fundType,
		currentYear = new Date().getFullYear(),
		yearRange = startYear ? `${startYear}_${currentYear}` : "";

	const projectSummaryUrl = `https://cbpfapib.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_PROJ_SUMMARY&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${selectedFundType}&$format=csv`,
		sectorsDataUrl = `https://cbpfapib.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_RPT_CLST_BENEF&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${selectedFundType}&$format=csv`,
		globalIndicatorsUrl = `https://cbpfapib.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_GLB_INDIC&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=&IndicatorTypeId=&FundTypeId=${selectedFundType}&$format=csv`,
		allocationTypesMasterUrl = `https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&AllocationYear=${yearRange}&$format=csv`,
		organizationMasterUrl = `https://cbpfapib.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_ORG_SUMMARY&PoolfundCodeAbbrv=&FundTypeId=${selectedFundType}&$format=csv`,
		allocationsLollipopUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=ALLOCATION_TOTAL_V3&PoolfundCodeAbbrv=&AllocationYearFrom=${startYear}&ShowAllPooledFunds=0&AllocationYearTo=${currentYear}&FundingType=3&$format=csv`;

	const [data, setData] = useState<Data>([] as Data),
		[dataIndicators, setDataIndicators] = useState<
			GlobalIndicatorsObject[]
		>([] as GlobalIndicatorsObject[]),
		[totalBeneficiariesData, setTotalBeneficiariesData] =
			useState<TotalBeneficiariesData>({} as TotalBeneficiariesData),
		[totalBeneficiariesTranche1Data, setTotalBeneficiariesTranche1Data] =
			useState<TotalBeneficiariesData>({} as TotalBeneficiariesData),
		[totalBeneficiariesTranche2Data, setTotalBeneficiariesTranche2Data] =
			useState<TotalBeneficiariesData>({} as TotalBeneficiariesData),
		[lists, setLists] = useState<List>({} as List),
		[inDataLists, setInDataLists] = useState<InDataLists>(
			{} as InDataLists,
		),
		[allocationsLollipopData, setAllocationsLollipopData] = useState<
			AllocationsLollipopObject[]
		>([] as AllocationsLollipopObject[]);

	const [loading, setLoading] = useState<boolean>(true),
		[error, setError] = useState<string | null>(null);

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
				fetchFileDB<AllocationTypesMasterObject[]>(
					"allocationTypesMaster",
					allocationTypesMasterUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFileDB<OrganizationMasterObject[]>(
					"organizationMaster",
					organizationMasterUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFileDB<AllocationsLollipopObject[]>(
					"allocationsLollipop",
					allocationsLollipopUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFile<BeneficiaryTypesMasterObject[]>(
					"beneficiaryTypesMaster",
					beneficiaryTypesMasterUrl,
					"csv",
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
				fetchFile<PooledFundsWithRegionMasterObject[]>(
					"pooledFundsWithRegionMaster",
					pooledFundWithRegionMasterUrl,
					"json",
				),
				setProgress,
			),
			trackProgress(
				fetchFile<TotalBeneficiariesObject[]>(
					"totalBeneficiaries",
					totalBeneficiariesUrl,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFile<TotalBeneficiariesObject[]>(
					"totalBeneficiariesTranche1",
					totalBeneficiariesTranche1Url,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFile<TotalBeneficiariesObject[]>(
					"totalBeneficiariesTranche2",
					totalBeneficiariesTranche2Url,
					"csv",
				),
				setProgress,
			),
			trackProgress(
				fetchFile<OrganizationIdsMapObject[]>(
					"organizationIdsMap",
					organizationIdsMapUrl,
					"json",
				),
				setProgress,
			),
			trackProgress(
				fetchFile<TemplatesMasterJson>(
					"templatesMaster",
					templatesMasterUrl,
					"json",
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
			allocationTypesMaster,
			organizationMaster,
			allocationsLollipopData,
			beneficiaryTypesMaster,
			pooledFundsMaster,
			allocationSourcesMaster,
			organizationTypesMaster,
			sectorsMaster,
			globalIndicatorsMaster,
			pooledFundsWithRegionMaster,
			totalBeneficiaries,
			totalBeneficiariesTranche1,
			totalBeneficiariesTranche2,
			organizationIdsMap,
			templatesMaster,
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
				pooledFundsWithRegionMaster,
			});

			const {
				data,
				totalBeneficiariesData,
				totalBeneficiariesTranche1Data,
				totalBeneficiariesTranche2Data,
			} = processRawData({
				projectSummary,
				sectorsData,
				listsObj,
				setInDataLists,
				totalBeneficiaries,
				totalBeneficiariesTranche1,
				totalBeneficiariesTranche2,
				organizationIdsMap,
				templatesMaster,
			});

			setData(data);
			setDataIndicators(globalIndicatorsData);
			setTotalBeneficiariesData(totalBeneficiariesData);
			setTotalBeneficiariesTranche1Data(totalBeneficiariesTranche1Data);
			setTotalBeneficiariesTranche2Data(totalBeneficiariesTranche2Data);
			setLists(listsObj);
			setLoading(false);
			setAllocationsLollipopData(allocationsLollipopData);
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		data,
		dataIndicators,
		lists,
		inDataLists,
		totalBeneficiariesData,
		totalBeneficiariesTranche1Data,
		totalBeneficiariesTranche2Data,
		loading,
		error,
		progress,
		totalFiles,
		allocationsLollipopData,
	};
}

export default useData;
