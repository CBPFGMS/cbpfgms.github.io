import { useEffect, useState } from "react"; //REMOVE LATER
import fetchFile from "./fetchfile";
import fetchFileDB from "./fetchfiledb";
import makeLists, { List } from "./makelists";
import processRawData, {
	Data,
	InDataLists,
	TotalBeneficiariesData,
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
		"https://pfbi-eastus2-api-site.azurewebsites.net/beneficiary/api/v1/beneficiary?year=2026&$format=csv";

//fake data path on staging site: ./assets/stg-data/

function useData(
	defaultFundType: number | null,
	startYear: number | null,
): {
	data: Data;
	lists: List;
	inDataLists: InDataLists;
	totalBeneficiariesData: TotalBeneficiariesData;
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
			useState<TotalBeneficiariesData>({} as TotalBeneficiariesData);

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

			const { data, totalBeneficiariesData } = processRawData({
				projectSummary,
				sectorsData,
				cvaData,
				listsObj,
				setInDataLists,
				totalBeneficiaries,
			});

			setData(data);
			setLists(listsObj);
			setTotalBeneficiariesData(totalBeneficiariesData);
			setLoading(false);
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		data,
		lists,
		inDataLists,
		totalBeneficiariesData,
		loading,
		error,
		progress,
	};
}

export default useData;
