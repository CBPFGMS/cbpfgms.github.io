import { useEffect, useState } from "react"; //REMOVE LATER
import fetchFile from "./fetchfile";
import fetchFileDB from "./fetchfiledb";
import makeLists, { type List } from "./makelists";
import processRawData, { type Data, type InDataLists } from "./processrawdata";
import {
	type AllocationSourcesMasterObject,
	type AllocationTypesMasterObject,
	type BeneficiaryTypesMasterObject,
	type OrganizationMasterObject,
	type OrganizationTypesMasterObject,
	type PooledFundsMasterObject,
	type ProjectStatusMasterObject,
	type ProjectSummaryObject,
	type SectorBeneficiaryObject,
	type SectorsMasterObject,
	type GlobalIndicatorsMasterObject,
	type GlobalIndicatorsObject,
	type EmergenciesMasterObject,
	type EmergenciesObject,
	type CvaObject,
	type CvaMasterObject,
} from "./schemas";

type ReceiveDataArgs = [
	ProjectSummaryObject[],
	SectorBeneficiaryObject[],
	GlobalIndicatorsObject[],
	EmergenciesObject[],
	CvaObject[],
	AllocationTypesMasterObject[],
	OrganizationMasterObject[],
	ProjectStatusMasterObject[],
	BeneficiaryTypesMasterObject[],
	PooledFundsMasterObject[],
	AllocationSourcesMasterObject[],
	OrganizationTypesMasterObject[],
	SectorsMasterObject[],
	GlobalIndicatorsMasterObject[],
	EmergenciesMasterObject[],
	CvaMasterObject[]
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
	globalIndicatorsMasterUrl =
		"https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=GLB_INDIC_MST&GlobalIndicatorType=&$format=csv",
	emergenciesMasterUrl =
		"https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=EMERG_TYPE_MST&$format=csv",
	cvaMasterUrl = "../data/fake_cvamaster.csv"; //TODO: change to real data

//fake data path on staging site: ./assets/stg-data/

function useData(
	defaultFundType: number | null,
	startYear: number | null
): {
	data: Data;
	dataIndicators: GlobalIndicatorsObject[];
	lists: List;
	inDataLists: InDataLists;
	loading: boolean;
	error: string | null;
	progress: number;
} {
	const fundType = defaultFundType ? defaultFundType : "",
		yearRange = startYear ? `${startYear}_${new Date().getFullYear()}` : "";

	const projectSummaryUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_PROJ_SUMMARY&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${fundType}&$format=csv`,
		sectorsDataUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_RPT_CLST_BENEF&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${fundType}&$format=csv`,
		globalIndicatorsUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_GLB_INDIC&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=&IndicatorTypeId=&FundTypeId=${fundType}&$format=csv`,
		emergenciesDataUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PROJECT_EMERGENCY_OneGMS&PoolfundCodeAbbrv=&AllocationYear=&FundTypeId=${fundType}&$format=csv`,
		allocationTypesMasterUrl = `https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&AllocationYear=${yearRange}&$format=csv`,
		organizationMasterUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_ORG_SUMMARY&PoolfundCodeAbbrv=&FundTypeId=${fundType}&$format=csv`,
		projectStatusMasterUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_GLB_STATUS&PoolfundCodeAbbrv=&InstanceTypeId=&FundTypeId=${fundType}&$format=csv`,
		cvaDataUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=APIDAT_CVA&PoolfundCodeAbbrv=&AllocationYear=&FundTypeId=${fundType}&$format=csv`;

	const [data, setData] = useState<Data>([] as Data),
		[dataIndicators, setDataIndicators] = useState<
			GlobalIndicatorsObject[]
		>([] as GlobalIndicatorsObject[]),
		[lists, setLists] = useState<List>({} as List),
		[inDataLists, setInDataLists] = useState<InDataLists>(
			{} as InDataLists
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
				setProgress
			),
			fetchFileDB<SectorBeneficiaryObject[]>(
				"sectorsData",
				sectorsDataUrl,
				"csv",
				setProgress
			),
			fetchFileDB<GlobalIndicatorsObject[]>(
				"globalIndicators",
				globalIndicatorsUrl,
				"csv",
				setProgress
			),
			fetchFileDB<EmergenciesObject[]>(
				"emergenciesData",
				emergenciesDataUrl,
				"csv",
				setProgress
			),
			fetchFileDB<CvaObject[]>("CVAData", cvaDataUrl, "csv", setProgress),
			fetchFile<AllocationTypesMasterObject[]>(
				"allocationTypesMaster",
				allocationTypesMasterUrl,
				"csv",
				setProgress
			),
			fetchFile<OrganizationMasterObject[]>(
				"organizationMaster",
				organizationMasterUrl,
				"csv",
				setProgress
			),
			fetchFile<ProjectStatusMasterObject[]>(
				"projectStatusMaster",
				projectStatusMasterUrl,
				"csv",
				setProgress
			),
			fetchFile<BeneficiaryTypesMasterObject[]>(
				"beneficiaryTypesMaster",
				beneficiaryTypesMasterUrl,
				"csv",
				setProgress
			),
			fetchFile<PooledFundsMasterObject[]>(
				"pooledFundsMaster",
				pooledFundsMasterUrl,
				"csv",
				setProgress
			),
			fetchFile<AllocationSourcesMasterObject[]>(
				"allocationSourcesMaster",
				allocationSourcesMasterUrl,
				"csv",
				setProgress
			),
			fetchFile<OrganizationTypesMasterObject[]>(
				"organizationTypesMaster",
				organizationTypesMasterUrl,
				"csv",
				setProgress
			),
			fetchFile<SectorsMasterObject[]>(
				"sectorsMaster",
				sectorsMasterUrl,
				"csv",
				setProgress
			),
			fetchFile<GlobalIndicatorsMasterObject[]>(
				"globalIndicatorsMaster",
				globalIndicatorsMasterUrl,
				"csv",
				setProgress
			),
			fetchFile<EmergenciesMasterObject[]>(
				"emergenciesMaster",
				emergenciesMasterUrl,
				"csv",
				setProgress
			),
			fetchFile<CvaMasterObject[]>(
				"cvaMaster",
				cvaMasterUrl,
				"csv",
				setProgress
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
			globalIndicatorsData,
			emergenciesData,
			cvaData,
			allocationTypesMaster,
			organizationMaster,
			projectStatusMaster,
			beneficiaryTypesMaster,
			pooledFundsMaster,
			allocationSourcesMaster,
			organizationTypesMaster,
			sectorsMaster,
			globalIndicatorsMaster,
			emergenciesMaster,
			cvaMaster,
		]: ReceiveDataArgs): void {
			const listsObj: List = makeLists({
				allocationTypesMaster,
				organizationMaster,
				projectStatusMaster,
				beneficiaryTypesMaster,
				pooledFundsMaster,
				allocationSourcesMaster,
				organizationTypesMaster,
				sectorsMaster,
				globalIndicatorsMaster,
				emergenciesMaster,
				cvaMaster,
			});

			const data: Data = processRawData({
				projectSummary,
				sectorsData,
				emergenciesData,
				cvaData,
				listsObj,
				setInDataLists,
			});

			setData(data);
			setDataIndicators(globalIndicatorsData);
			setLists(listsObj);
			setLoading(false);
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
	};
}

export default useData;
