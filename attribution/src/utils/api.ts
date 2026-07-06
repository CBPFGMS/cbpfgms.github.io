import fetchFile from "./fetchfile";
import fetchFileDB from "./fetchfiledb";
import type {
	PooledFundsMasterObject,
	SectorsMasterObject,
	OrganizationTypesMasterObject,
	AllocationSourcesMasterObject,
	ContributionsObject,
	DonorsMasterObject,
	PooledFundsWithRegionMasterObject,
	AllocationTypesMasterObject,
	OrganizationMasterObject,
} from "./schemas";
import makeLists, { type List } from "./makelists";
// import processRawData, {
// 	type AllocationsData,
// 	type InAllocationsDataLists,
// } from "./processrawdata";
import processContributionsData, {
	type ContributionsData,
	type InContributionsDataLists,
} from "./processcontributionsdata";
// import processLocationsData, {
// 	type LocationsData,
// } from "../utils/processlocationsdata";
import { constants } from "./constants";

export type AppData = {
	// allocationsData: AllocationsData;
	// allocationsInDataLists: InAllocationsDataLists;
	contributionsData: ContributionsData;
	inContributionsDataLists: InContributionsDataLists;
	// locationsData: LocationsData;
	lists: List;
};

type ReceiveDataArgs = [
	ContributionsObject[],
	AllocationTypesMasterObject[],
	OrganizationMasterObject[],
	PooledFundsMasterObject[],
	SectorsMasterObject[],
	OrganizationTypesMasterObject[],
	AllocationSourcesMasterObject[],
	PooledFundsWithRegionMasterObject[],
	DonorsMasterObject[],
];

const { fundType, currentYear } = constants;

// const baseUrl =
// 	"https://raw.githubusercontent.com/CBPFGMS/cbpfgms-data/master/utils/FT_allocations_overview_static/data/";

const pooledFundsMasterUrl =
		"https://cbpfapi.unocha.org/vo2/odata/MstPooledFund?$format=csv",
	allocationSourcesMasterUrl =
		"https://cbpfapi.unocha.org/vo2/odata/MstAllocationSource?$format=csv",
	organizationTypesMasterUrl =
		"https://cbpfapi.unocha.org/vo2/odata/MstOrgType?$format=csv",
	sectorsMasterUrl =
		"https://cbpfapi.unocha.org/vo2/odata/MstClusters?$format=csv",
	pooledFundWithRegionMasterUrl =
		"https://cbpfgms.github.io/pfbi-data/mst/MstCountry.json",
	donorsMaster =
		"https://cbpfapi.unocha.org/vo2/odata/DonorMaster?$format=csv";

export async function fetchAppData(
	startYear: number | null,
	defaultFundType: number | null,
): Promise<AppData> {
	// const yearRange = startYear
	// 	? `${startYear}_${new Date().getFullYear()}`
	// 	: "";

	// const projectSummaryAggregatedUrl = `${baseUrl}ProjectSummaryAggV2_${startYear}.csv`;

	const selectedFundType = defaultFundType ? defaultFundType : fundType,
		yearRange = startYear ? `${startYear}_${currentYear}` : "";

	const contributionsUrl = "contributions.csv",
		allocationTypesMasterUrl = `https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&AllocationYear=${yearRange}&$format=csv`,
		organizationMasterUrl = `https://cbpfapib.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_ORG_SUMMARY&PoolfundCodeAbbrv=&FundTypeId=${selectedFundType}&$format=csv`;

	return Promise.all([
		fetchFileDB<ContributionsObject[]>(
			"contributions",
			contributionsUrl,
			"csv",
		),
		fetchFileDB<AllocationTypesMasterObject[]>(
			"allocationTypesMaster",
			allocationTypesMasterUrl,
			"csv",
		),
		fetchFileDB<OrganizationMasterObject[]>(
			"organizationMaster",
			organizationMasterUrl,
			"csv",
		),
		fetchFile<PooledFundsMasterObject[]>(
			"pooledFundsMaster",
			pooledFundsMasterUrl,
			"csv",
		),
		fetchFile<SectorsMasterObject[]>(
			"sectorsMaster",
			sectorsMasterUrl,
			"csv",
		),
		fetchFile<OrganizationTypesMasterObject[]>(
			"organizationTypesMaster",
			organizationTypesMasterUrl,
			"csv",
		),
		fetchFile<AllocationSourcesMasterObject[]>(
			"allocationSourcesMaster",
			allocationSourcesMasterUrl,
			"csv",
		),
		fetchFile<PooledFundsWithRegionMasterObject[]>(
			"pooledFundsWithRegionMaster",
			pooledFundWithRegionMasterUrl,
			"json",
		),
		fetchFile<DonorsMasterObject[]>("donorsMaster", donorsMaster, "csv"),
	])
		.then(receiveData)
		.catch((error: unknown) => {
			console.error("Error fetching app data:", error);
			throw error;
		});

	function receiveData([
		contributions,
		allocationTypesMaster,
		organizationMaster,
		pooledFundsMaster,
		sectorsMaster,
		organizationTypesMaster,
		allocationSourcesMaster,
		pooledFundsWithRegionMaster,
		donorsMaster,
	]: ReceiveDataArgs): AppData {
		const lists = makeLists({
			pooledFundsMaster,
			allocationSourcesMaster,
			organizationTypesMaster,
			allocationTypesMaster,
			organizationMaster,
			sectorsMaster,
			pooledFundsWithRegionMaster,
			donorsMaster,
		});

		const { contributionsData, inContributionsDataLists } =
			processContributionsData({
				contributions,
				lists,
			});

		// const { data, inDataLists } = processRawData({
		// 	projectSummaryAggregated,
		// 	projectSummary,
		// 	activities,
		// 	lists,
		// });

		return {
			contributionsData,
			inContributionsDataLists,
			lists,
		};
	}
}
