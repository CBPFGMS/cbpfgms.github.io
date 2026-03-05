import { useEffect, useState } from "react";
import fetchFile from "./fetchfile";
import fetchFileDB from "./fetchfiledb";
import makeLists, { type List } from "./makelists";
import processRawData, { type Data, type InDataLists } from "./processrawdata";
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
} from "./schemas";
import { constants } from "./constants";

type ReceiveDataArgs = [
	ProjectSummaryObject[],
	SectorBeneficiaryObject[],
	GlobalIndicatorsObject[],
	AllocationTypesMasterObject[],
	OrganizationMasterObject[],
	BeneficiaryTypesMasterObject[],
	PooledFundsMasterObject[],
	AllocationSourcesMasterObject[],
	OrganizationTypesMasterObject[],
	SectorsMasterObject[],
	GlobalIndicatorsMasterObject[],
	PooledFundsWithRegionMasterObject[],
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
		"https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=GLB_INDIC_MST&GlobalIndicatorType=&$format=csv",
	pooledFundWithRegionMasterUrl =
		"https://cbpfgms.github.io/pfbi-data/mst/MstCountry.json";

//fake data path on staging site: ./assets/stg-data/

function useData(
	defaultFundType: number | null,
	startYear: number | null,
): {
	data: Data;
	dataIndicators: GlobalIndicatorsObject[];
	lists: List;
	inDataLists: InDataLists;
	loading: boolean;
	error: string | null;
	progress: number;
} {
	const selectedFundType = defaultFundType ? defaultFundType : fundType,
		yearRange = startYear ? `${startYear}_${new Date().getFullYear()}` : "";

	const projectSummaryUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_PROJ_SUMMARY&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${selectedFundType}&$format=csv`,
		sectorsDataUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_RPT_CLST_BENEF&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${selectedFundType}&$format=csv`,
		globalIndicatorsUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_GLB_INDIC&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=&IndicatorTypeId=&FundTypeId=${selectedFundType}&$format=csv`,
		allocationTypesMasterUrl = `https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&AllocationYear=${yearRange}&$format=csv`,
		organizationMasterUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_ORG_SUMMARY&PoolfundCodeAbbrv=&FundTypeId=${selectedFundType}&$format=csv`;

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
			fetchFileDB<GlobalIndicatorsObject[]>(
				"globalIndicators",
				globalIndicatorsUrl,
				"csv",
				setProgress,
			),
			fetchFileDB<AllocationTypesMasterObject[]>(
				"allocationTypesMaster",
				allocationTypesMasterUrl,
				"csv",
				setProgress,
			),
			fetchFileDB<OrganizationMasterObject[]>(
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
			fetchFile<GlobalIndicatorsMasterObject[]>(
				"globalIndicatorsMaster",
				globalIndicatorsMasterUrl,
				"csv",
				setProgress,
			),
			fetchFile<PooledFundsWithRegionMasterObject[]>(
				"pooledFundsWithRegionMaster",
				pooledFundWithRegionMasterUrl,
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
			globalIndicatorsData,
			allocationTypesMaster,
			organizationMaster,
			beneficiaryTypesMaster,
			pooledFundsMaster,
			allocationSourcesMaster,
			organizationTypesMaster,
			sectorsMaster,
			globalIndicatorsMaster,
			pooledFundsWithRegionMaster,
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

			const data: Data = processRawData({
				projectSummary,
				sectorsData,
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
