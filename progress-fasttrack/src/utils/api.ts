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
	CvaObject,
	CvaMasterObject,
	TotalBeneficiariesObject,
	TotalBeneficiariesByPartnerObject,
	TotalBeneficiariesBySectorObject,
	TotalBeneficiariesByBeneficiaryTypeObject,
	TemplatesMasterJson,
} from "./schemas";

type ReceiveDataArgs = [
	ProjectSummaryObject[],
	SectorBeneficiaryObject[],
	CvaObject[],
	AllocationTypesMasterObject[],
	OrganizationMasterObject[],
	BeneficiaryTypesMasterObject[],
	PooledFundsMasterObject[],
	AllocationSourcesMasterObject[],
	OrganizationTypesMasterObject[],
	SectorsMasterObject[],
	CvaMasterObject[],
	TotalBeneficiariesObject[],
	TotalBeneficiariesObject[],
	TotalBeneficiariesObject[],
	TotalBeneficiariesByPartnerObject[],
	TotalBeneficiariesByPartnerObject[],
	TotalBeneficiariesByPartnerObject[],
	TotalBeneficiariesBySectorObject[],
	TotalBeneficiariesBySectorObject[],
	TotalBeneficiariesBySectorObject[],
	TotalBeneficiariesByBeneficiaryTypeObject[],
	TotalBeneficiariesByBeneficiaryTypeObject[],
	TotalBeneficiariesByBeneficiaryTypeObject[],
	TemplatesMasterJson,
];

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
	cvaMasterUrl =
		"https://cbpfapib.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=MstCVAType",
	totalBeneficiariesUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/beneficiary/?group_name=US_Tranche_2026&$format=csv",
	totalBeneficiariesTranche1Url =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/beneficiary/?group_name=US_Tranche1_2026&$format=csv",
	totalBeneficiariesTranche2Url =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/beneficiary/?group_name=US_Tranche2_2026&$format=csv",
	totalBeneficiariesByPartnerUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/beneficiaryByPartnerType/?group_name=US_Tranche_2026&$format=csv",
	totalBeneficiariesByPartnerTranche1Url =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/beneficiaryByPartnerType/?group_name=US_Tranche1_2026&$format=csv",
	totalBeneficiariesByPartnerTranche2Url =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/beneficiaryByPartnerType/?group_name=US_Tranche2_2026&$format=csv",
	totalBeneficiariesBySectorUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/beneficiaryByCluster/?group_name=US_Tranche_2026&$format=csv",
	totalBeneficiariesBySectorTranche1Url =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/beneficiaryByCluster/?group_name=US_Tranche1_2026&$format=csv",
	totalBeneficiariesBySectorTranche2Url =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/beneficiaryByCluster/?group_name=US_Tranche2_2026&$format=csv",
	totalBeneficiariesByBeneficiaryTypeUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/beneficiaryByBenType/?group_name=US_Tranche_2026&$format=csv",
	totalBeneficiariesByBeneficiaryTypeTranche1Url =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/beneficiaryByBenType/?group_name=US_Tranche1_2026&$format=csv",
	totalBeneficiariesByBeneficiaryTypeTranche2Url =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/beneficiaryByBenType/?group_name=US_Tranche2_2026&$format=csv",
	templatesMasterUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/templates/?includeProjectCode=1";

function useData(
	defaultFundType: number | null,
	startYear: number | null,
): {
	data: Data;
	lists: List;
	inDataLists: InDataLists;
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesTranche1Data: TotalBeneficiariesData;
	totalBeneficiariesTranche2Data: TotalBeneficiariesData;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesByPartnerTranche1Data: TotalBeneficiariesByPartnerData;
	totalBeneficiariesByPartnerTranche2Data: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	totalBeneficiariesBySectorTranche1Data: TotalBeneficiariesBySectorData;
	totalBeneficiariesBySectorTranche2Data: TotalBeneficiariesBySectorData;
	totalBeneficiariesByBeneficiaryTypeData: TotalBeneficiariesByBeneficiaryTypeData;
	totalBeneficiariesByBeneficiaryTypeTranche1Data: TotalBeneficiariesByBeneficiaryTypeData;
	totalBeneficiariesByBeneficiaryTypeTranche2Data: TotalBeneficiariesByBeneficiaryTypeData;
	loading: boolean;
	error: string | null;
	progress: number;
} {
	const fundType = defaultFundType ? defaultFundType : "",
		yearRange = startYear ? `${startYear}_${new Date().getFullYear()}` : "";

	const projectSummaryUrl = `https://cbpfapib.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_PROJ_SUMMARY&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${fundType}&$format=csv`,
		sectorsDataUrl = `https://cbpfapib.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_RPT_CLST_BENEF&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${fundType}&$format=csv`,
		allocationTypesMasterUrl = `https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&AllocationYear=${yearRange}&$format=csv`,
		organizationMasterUrl = `https://cbpfapib.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_ORG_SUMMARY&PoolfundCodeAbbrv=&FundTypeId=${fundType}&$format=csv`,
		cvaDataUrl = `https://cbpfapib.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=APIDAT_CVA&PoolfundCodeAbbrv=&AllocationYear=&FundTypeId=${fundType}&$format=csv`;

	const [data, setData] = useState<Data>([] as Data),
		[lists, setLists] = useState<List>({} as List),
		[inDataLists, setInDataLists] = useState<InDataLists>(
			{} as InDataLists,
		),
		[totalBeneficiariesData, setTotalBeneficiariesData] =
			useState<TotalBeneficiariesData>({} as TotalBeneficiariesData),
		[totalBeneficiariesTranche1Data, setTotalBeneficiariesTranche1Data] =
			useState<TotalBeneficiariesData>({} as TotalBeneficiariesData),
		[totalBeneficiariesTranche2Data, setTotalBeneficiariesTranche2Data] =
			useState<TotalBeneficiariesData>({} as TotalBeneficiariesData),
		[totalBeneficiariesByPartnerData, setTotalBeneficiariesByPartnerData] =
			useState<TotalBeneficiariesByPartnerData>(
				{} as TotalBeneficiariesByPartnerData,
			),
		[
			totalBeneficiariesByPartnerTranche1Data,
			setTotalBeneficiariesByPartnerTranche1Data,
		] = useState<TotalBeneficiariesByPartnerData>(
			{} as TotalBeneficiariesByPartnerData,
		),
		[
			totalBeneficiariesByPartnerTranche2Data,
			setTotalBeneficiariesByPartnerTranche2Data,
		] = useState<TotalBeneficiariesByPartnerData>(
			{} as TotalBeneficiariesByPartnerData,
		),
		[totalBeneficiariesBySectorData, setTotalBeneficiariesBySectorData] =
			useState<TotalBeneficiariesBySectorData>(
				{} as TotalBeneficiariesBySectorData,
			),
		[
			totalBeneficiariesBySectorTranche1Data,
			setTotalBeneficiariesBySectorTranche1Data,
		] = useState<TotalBeneficiariesBySectorData>(
			{} as TotalBeneficiariesBySectorData,
		),
		[
			totalBeneficiariesBySectorTranche2Data,
			setTotalBeneficiariesBySectorTranche2Data,
		] = useState<TotalBeneficiariesBySectorData>(
			{} as TotalBeneficiariesBySectorData,
		),
		[
			totalBeneficiariesByBeneficiaryTypeData,
			setTotalBeneficiariesByBeneficiaryTypeData,
		] = useState<TotalBeneficiariesByBeneficiaryTypeData>(
			{} as TotalBeneficiariesByBeneficiaryTypeData,
		),
		[
			totalBeneficiariesByBeneficiaryTypeTranche1Data,
			setTotalBeneficiariesByBeneficiaryTypeTranche1Data,
		] = useState<TotalBeneficiariesByBeneficiaryTypeData>(
			{} as TotalBeneficiariesByBeneficiaryTypeData,
		),
		[
			totalBeneficiariesByBeneficiaryTypeTranche2Data,
			setTotalBeneficiariesByBeneficiaryTypeTranche2Data,
		] = useState<TotalBeneficiariesByBeneficiaryTypeData>(
			{} as TotalBeneficiariesByBeneficiaryTypeData,
		);

	const [loading, setLoading] = useState<boolean>(true),
		[error, setError] = useState<string | null>(null);

	const [progress, setProgress] = useState<number>(0);

	useEffect(() => {
		Promise.all([
			fetchFileDB<ProjectSummaryObject[]>(
				"projectSummary",
				projectSummaryUrl,
				"csv",
				setProgress,
			),
			fetchFileDB<SectorBeneficiaryObject[]>(
				"sectorsData",
				sectorsDataUrl,
				"csv",
				setProgress,
			),
			fetchFileDB<CvaObject[]>("CVAData", cvaDataUrl, "csv", setProgress),
			fetchFile<AllocationTypesMasterObject[]>(
				"allocationTypesMaster",
				allocationTypesMasterUrl,
				"csv",
				setProgress,
			),
			fetchFile<OrganizationMasterObject[]>(
				"organizationMaster",
				organizationMasterUrl,
				"csv",
				setProgress,
			),
			fetchFile<BeneficiaryTypesMasterObject[]>(
				"beneficiaryTypesMaster",
				beneficiaryTypesMasterUrl,
				"csv",
				setProgress,
			),
			fetchFile<PooledFundsMasterObject[]>(
				"pooledFundsMaster",
				pooledFundsMasterUrl,
				"csv",
				setProgress,
			),
			fetchFile<AllocationSourcesMasterObject[]>(
				"allocationSourcesMaster",
				allocationSourcesMasterUrl,
				"csv",
				setProgress,
			),
			fetchFile<OrganizationTypesMasterObject[]>(
				"organizationTypesMaster",
				organizationTypesMasterUrl,
				"csv",
				setProgress,
			),
			fetchFile<SectorsMasterObject[]>(
				"sectorsMaster",
				sectorsMasterUrl,
				"csv",
				setProgress,
			),
			fetchFile<CvaMasterObject[]>(
				"cvaMaster",
				cvaMasterUrl,
				"json",
				setProgress,
			),
			fetchFile<TotalBeneficiariesObject[]>(
				"totalBeneficiaries",
				totalBeneficiariesUrl,
				"csv",
				setProgress,
			),
			fetchFile<TotalBeneficiariesObject[]>(
				"totalBeneficiariesTranche1",
				totalBeneficiariesTranche1Url,
				"csv",
				setProgress,
			),
			fetchFile<TotalBeneficiariesObject[]>(
				"totalBeneficiariesTranche2",
				totalBeneficiariesTranche2Url,
				"csv",
				setProgress,
			),
			fetchFile<TotalBeneficiariesByPartnerObject[]>(
				"totalBeneficiariesByPartner",
				totalBeneficiariesByPartnerUrl,
				"csv",
				setProgress,
			),
			fetchFile<TotalBeneficiariesByPartnerObject[]>(
				"totalBeneficiariesByPartnerTranche1",
				totalBeneficiariesByPartnerTranche1Url,
				"csv",
				setProgress,
			),
			fetchFile<TotalBeneficiariesByPartnerObject[]>(
				"totalBeneficiariesByPartnerTranche2",
				totalBeneficiariesByPartnerTranche2Url,
				"csv",
				setProgress,
			),
			fetchFile<TotalBeneficiariesBySectorObject[]>(
				"totalBeneficiariesBySector",
				totalBeneficiariesBySectorUrl,
				"csv",
				setProgress,
			),
			fetchFile<TotalBeneficiariesBySectorObject[]>(
				"totalBeneficiariesBySectorTranche1",
				totalBeneficiariesBySectorTranche1Url,
				"csv",
				setProgress,
			),
			fetchFile<TotalBeneficiariesBySectorObject[]>(
				"totalBeneficiariesBySectorTranche2",
				totalBeneficiariesBySectorTranche2Url,
				"csv",
				setProgress,
			),
			fetchFile<TotalBeneficiariesByBeneficiaryTypeObject[]>(
				"totalBeneficiariesByBeneficiaryType",
				totalBeneficiariesByBeneficiaryTypeUrl,
				"csv",
				setProgress,
			),
			fetchFile<TotalBeneficiariesByBeneficiaryTypeObject[]>(
				"totalBeneficiariesByBeneficiaryTypeTranche1",
				totalBeneficiariesByBeneficiaryTypeTranche1Url,
				"csv",
				setProgress,
			),
			fetchFile<TotalBeneficiariesByBeneficiaryTypeObject[]>(
				"totalBeneficiariesByBeneficiaryTypeTranche2",
				totalBeneficiariesByBeneficiaryTypeTranche2Url,
				"csv",
				setProgress,
			),
			fetchFile<TemplatesMasterJson>(
				"templatesMaster",
				templatesMasterUrl,
				"json",
				setProgress,
			),
		])
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
			cvaData,
			allocationTypesMaster,
			organizationMaster,
			beneficiaryTypesMaster,
			pooledFundsMaster,
			allocationSourcesMaster,
			organizationTypesMaster,
			sectorsMaster,
			cvaMaster,
			totalBeneficiaries,
			totalBeneficiariesTranche1,
			totalBeneficiariesTranche2,
			totalBeneficiariesByPartner,
			totalBeneficiariesByPartnerTranche1,
			totalBeneficiariesByPartnerTranche2,
			totalBeneficiariesBySector,
			totalBeneficiariesBySectorTranche1,
			totalBeneficiariesBySectorTranche2,
			totalBeneficiariesByBeneficiaryType,
			totalBeneficiariesByBeneficiaryTypeTranche1,
			totalBeneficiariesByBeneficiaryTypeTranche2,
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
				cvaMaster,
			});

			const {
				data,
				totalBeneficiariesData,
				totalBeneficiariesTranche1Data,
				totalBeneficiariesTranche2Data,
				totalBeneficiariesByPartnerData,
				totalBeneficiariesByPartnerTranche1Data,
				totalBeneficiariesByPartnerTranche2Data,
				totalBeneficiariesBySectorData,
				totalBeneficiariesBySectorTranche1Data,
				totalBeneficiariesBySectorTranche2Data,
				totalBeneficiariesByBeneficiaryTypeData,
				totalBeneficiariesByBeneficiaryTypeTranche1Data,
				totalBeneficiariesByBeneficiaryTypeTranche2Data,
			} = processRawData({
				projectSummary,
				sectorsData,
				cvaData,
				listsObj,
				setInDataLists,
				totalBeneficiaries,
				totalBeneficiariesTranche1,
				totalBeneficiariesTranche2,
				totalBeneficiariesByPartner,
				totalBeneficiariesByPartnerTranche1,
				totalBeneficiariesByPartnerTranche2,
				totalBeneficiariesBySector,
				totalBeneficiariesBySectorTranche1,
				totalBeneficiariesBySectorTranche2,
				totalBeneficiariesByBeneficiaryType,
				totalBeneficiariesByBeneficiaryTypeTranche1,
				totalBeneficiariesByBeneficiaryTypeTranche2,
				templatesMaster,
			});

			setData(data);
			setLists(listsObj);
			setTotalBeneficiariesData(totalBeneficiariesData);
			setTotalBeneficiariesTranche1Data(totalBeneficiariesTranche1Data);
			setTotalBeneficiariesTranche2Data(totalBeneficiariesTranche2Data);
			setTotalBeneficiariesByPartnerData(totalBeneficiariesByPartnerData);
			setTotalBeneficiariesByPartnerTranche1Data(
				totalBeneficiariesByPartnerTranche1Data,
			);
			setTotalBeneficiariesByPartnerTranche2Data(
				totalBeneficiariesByPartnerTranche2Data,
			);
			setTotalBeneficiariesBySectorData(totalBeneficiariesBySectorData);
			setTotalBeneficiariesBySectorTranche1Data(
				totalBeneficiariesBySectorTranche1Data,
			);
			setTotalBeneficiariesBySectorTranche2Data(
				totalBeneficiariesBySectorTranche2Data,
			);
			setTotalBeneficiariesByBeneficiaryTypeData(
				totalBeneficiariesByBeneficiaryTypeData,
			);
			setTotalBeneficiariesByBeneficiaryTypeTranche1Data(
				totalBeneficiariesByBeneficiaryTypeTranche1Data,
			);
			setTotalBeneficiariesByBeneficiaryTypeTranche2Data(
				totalBeneficiariesByBeneficiaryTypeTranche2Data,
			);
			setLoading(false);
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		data,
		lists,
		inDataLists,
		totalBeneficiariesData,
		totalBeneficiariesTranche1Data,
		totalBeneficiariesTranche2Data,
		totalBeneficiariesByPartnerData,
		totalBeneficiariesByPartnerTranche1Data,
		totalBeneficiariesByPartnerTranche2Data,
		totalBeneficiariesBySectorData,
		totalBeneficiariesBySectorTranche1Data,
		totalBeneficiariesBySectorTranche2Data,
		totalBeneficiariesByBeneficiaryTypeData,
		totalBeneficiariesByBeneficiaryTypeTranche1Data,
		totalBeneficiariesByBeneficiaryTypeTranche2Data,
		loading,
		error,
		progress,
	};
}

export default useData;
