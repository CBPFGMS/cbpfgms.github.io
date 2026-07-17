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
	ProjectSummaryObject,
	SectorBeneficiaryObject,
	TotalBeneficiariesObject,
	TotalBeneficiariesByPartnerObject,
	TotalBeneficiariesBySectorObject,
} from "./schemas";
import makeLists, { type List } from "./makelists";
import processRawData, {
	type AllocationsData,
	type InAllocationsDataLists,
	type TotalBeneficiariesByPartnerData,
	type TotalBeneficiariesBySectorData,
	type TotalBeneficiariesData,
} from "./processrawdata";
import processContributionsData, {
	type ContributionsData,
	type InContributionsDataLists,
} from "./processcontributionsdata";
// import processLocationsData, {
// 	type LocationsData,
// } from "../utils/processlocationsdata";
import { constants } from "./constants";

export type AppData = {
	allocationsData: AllocationsData;
	inAllocationsDataLists: InAllocationsDataLists;
	contributionsData: ContributionsData;
	inContributionsDataLists: InContributionsDataLists;
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	// locationsData: LocationsData;
	lists: List;
};

type ReceiveDataArgs = [
	ContributionsObject[],
	ProjectSummaryObject[],
	SectorBeneficiaryObject[],
	TotalBeneficiariesObject[],
	TotalBeneficiariesByPartnerObject[],
	TotalBeneficiariesBySectorObject[],
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
		"https://cbpfapi.unocha.org/vo2/odata/DonorMaster?$format=csv",
	totalBeneficiariesUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net/beneficiary/api/v2//beneficiary?year=2026&$format=csv", //TODO: check year query string
	totalBeneficiariesByPartnerUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net/beneficiary/api/v2//beneficiaryByPartnerType?year=2026&$format=csv", //TODO: check year query string
	totalBeneficiariesBySectorUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net/beneficiary/api/v2//beneficiaryByCluster?year=2026&$format=csv"; //TODO: check year query string

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

	const contributionsUrl = "contributions.csv", //TODO: change for live API
		projectSummaryUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_PROJ_SUMMARY&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${selectedFundType}&$format=csv`,
		sectorsDataUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_RPT_CLST_BENEF&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${selectedFundType}&$format=csv`,
		allocationTypesMasterUrl = `https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&AllocationYear=${yearRange}&$format=csv`,
		organizationMasterUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_ORG_SUMMARY&PoolfundCodeAbbrv=&FundTypeId=${selectedFundType}&$format=csv`;

	return Promise.all([
		fetchFileDB<ContributionsObject[]>(
			"contributions",
			contributionsUrl,
			"csv",
		),
		fetchFileDB<ProjectSummaryObject[]>(
			"projectSummary",
			projectSummaryUrl,
			"csv",
		),
		fetchFileDB<SectorBeneficiaryObject[]>(
			"sectors",
			sectorsDataUrl,
			"csv",
		),
		fetchFileDB<TotalBeneficiariesObject[]>(
			"totalBeneficiaries",
			totalBeneficiariesUrl,
			"csv",
		),
		fetchFileDB<TotalBeneficiariesByPartnerObject[]>(
			"totalBeneficiariesByPartner",
			totalBeneficiariesByPartnerUrl,
			"csv",
		),
		fetchFileDB<TotalBeneficiariesBySectorObject[]>(
			"totalBeneficiariesBySector",
			totalBeneficiariesBySectorUrl,
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
		projectSummary,
		sectorsData,
		totalBeneficiaries,
		totalBeneficiariesByPartner,
		totalBeneficiariesBySector,
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
				startYear,
			});

		const {
			allocationsData,
			inAllocationsDataLists,
			totalBeneficiariesData,
			totalBeneficiariesByPartnerData,
			totalBeneficiariesBySectorData,
		} = processRawData({
			projectSummary,
			sectorsData,
			totalBeneficiaries,
			totalBeneficiariesByPartner,
			totalBeneficiariesBySector,
			lists,
		});

		return {
			contributionsData,
			inContributionsDataLists,
			allocationsData,
			inAllocationsDataLists,
			totalBeneficiariesData,
			totalBeneficiariesByPartnerData,
			totalBeneficiariesBySectorData,
			lists,
		};
	}
}
