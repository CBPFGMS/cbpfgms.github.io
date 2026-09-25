import fetchFile from "./fetchfile";
import fetchFileDB from "./fetchfiledb";
import trackProgress from "./trackprogress";
import progressStore from "./progressstore";
import type {
	PooledFundsMasterObject,
	SectorsMasterObject,
	OrganizationTypesMasterObject,
	AllocationSourcesMasterObject,
	ContributionsJson,
	DonorsMasterObject,
	PooledFundsWithRegionMasterObject,
	AllocationTypesMasterObject,
	OrganizationMasterObject,
	ProjectSummaryObject,
	SectorBeneficiaryObject,
	TotalBeneficiariesObject,
	TotalBeneficiariesByPartnerObject,
	TotalBeneficiariesBySectorObject,
	AllocationsByYearAndFundObject,
} from "./schemas";
import makeLists, { type List } from "./makelists";
import processRawData, {
	type AllocationsData,
	type InAllocationsDataLists,
	type LocalizationData,
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
import generateRange from "./generateRange";

export type AppData = {
	allocationsData: AllocationsData;
	inAllocationsDataLists: InAllocationsDataLists;
	contributionsData: ContributionsData;
	inContributionsDataLists: InContributionsDataLists;
	totalBeneficiariesData: TotalBeneficiariesData;
	totalBeneficiariesByPartnerData: TotalBeneficiariesByPartnerData;
	totalBeneficiariesBySectorData: TotalBeneficiariesBySectorData;
	localizationDataWithUS: LocalizationData;
	localizationDataWithoutUS: LocalizationData;
	lists: List;
};

type ReceiveDataArgs = [
	ProjectSummaryObject[],
	SectorBeneficiaryObject[],
	TotalBeneficiariesObject[],
	TotalBeneficiariesByPartnerObject[],
	TotalBeneficiariesBySectorObject[],
	TotalBeneficiariesObject[],
	TotalBeneficiariesByPartnerObject[],
	TotalBeneficiariesBySectorObject[],
	AllocationsByYearAndFundObject[],
	AllocationsByYearAndFundObject[],
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
		"https://pfbi-eastus2-api-site.azurewebsites.net//bdt2/api/public/v1/beneficiary/?isByLocation=false&process_status=all&$format=csv",
	totalBeneficiariesByPartnerUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net//bdt2/api/public/v1/beneficiaryByPartnerType/?isByLocation=false&process_status=all&$format=csv",
	totalBeneficiariesBySectorUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net//bdt2/api/public/v1/beneficiaryByCluster/?isByLocation=false&process_status=all&$format=csv",
	totalBeneficiariesWithoutUsUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net//bdt2/api/public/v1/beneficiary/?isByLocation=false&process_status=all&allocation_category=NON_US&$format=csv",
	totalBeneficiariesByPartnerWithoutUsUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net//bdt2/api/public/v1/beneficiaryByPartnerType/?isByLocation=false&process_status=all&allocation_category=NON_US&$format=csv",
	totalBeneficiariesBySectorWithoutUsUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net//bdt2/api/public/v1/beneficiaryByCluster/?isByLocation=false&process_status=all&allocation_category=NON_US&$format=csv";

export async function fetchAppData(
	startYear: number | null,
	defaultFundType: number | null,
	selectedDonor: number,
): Promise<AppData> {
	const selectedFundType = defaultFundType ? defaultFundType : fundType,
		yearRange = startYear ? `${startYear}_${currentYear}` : "";

	const allocationsByYearAndFundUrlWithUS = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=ALLOCATION_TOTAL_V2&PoolfundCodeAbbrv=&AllocationYearFrom=${startYear}&ShowAllPooledFunds=1&AllocationYearTo=${currentYear}&FundingType=2&ShowNSFT=&$format=csv`,
		allocationsByYearAndFundUrlWithoutUS = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=ALLOCATION_TOTAL_V2&PoolfundCodeAbbrv=&AllocationYearFrom=${startYear}&ShowAllPooledFunds=1&AllocationYearTo=${currentYear}&FundingType=2&ShowNSFT=0&$format=csv`,
		projectSummaryUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_PROJ_SUMMARY&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${selectedFundType}&$format=csv`,
		sectorsDataUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_RPT_CLST_BENEF&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=${yearRange}&FundTypeId=${selectedFundType}&$format=csv`,
		allocationTypesMasterUrl = `https://cbpfapi.unocha.org/vo2/odata/AllocationTypes?PoolfundCodeAbbrv=&AllocationYear=${yearRange}&$format=csv`,
		organizationMasterUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_ORG_SUMMARY&PoolfundCodeAbbrv=&FundTypeId=${selectedFundType}&$format=csv`;

	const contributionsBaseUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net/donor_attribution/api/public/donors?";

	const yearsRangeArray = startYear
		? generateRange(startYear, currentYear, 1)
		: [currentYear];

	const contributionsUrlsWithoutUS = yearsRangeArray.map(
		year =>
			`${contributionsBaseUrl}year=${year}&donorId=${selectedDonor}&excludeUsa=1`,
	);

	const contributionsUrlsWithUS = yearsRangeArray.map(
		year => `${contributionsBaseUrl}year=${year}&donorId=${selectedDonor}`,
	);

	const combinedContributionsUrls = [
		...contributionsUrlsWithoutUS,
		...contributionsUrlsWithUS,
	];

	const dynamicFetchPromises = combinedContributionsUrls.map((url, index) =>
		trackProgress(
			fetchFileDB<ContributionsJson>(
				`donor${selectedDonor}_contributions${index}`,
				url,
				"json",
			),
			progressStore.increment,
		),
	);

	// `as const` keeps this a tuple, so Promise.all below still returns a
	// strongly-typed ReceiveDataArgs tuple, and its .length gives us an
	// accurate static file count for free.
	const staticFetchPromises = [
		trackProgress(
			fetchFileDB<ProjectSummaryObject[]>(
				"projectSummary",
				projectSummaryUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<SectorBeneficiaryObject[]>(
				"sectors",
				sectorsDataUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<TotalBeneficiariesObject[]>(
				"totalBeneficiaries",
				totalBeneficiariesUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<TotalBeneficiariesByPartnerObject[]>(
				"totalBeneficiariesByPartner",
				totalBeneficiariesByPartnerUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<TotalBeneficiariesBySectorObject[]>(
				"totalBeneficiariesBySector",
				totalBeneficiariesBySectorUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<TotalBeneficiariesObject[]>(
				"totalBeneficiariesWithoutUs",
				totalBeneficiariesWithoutUsUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<TotalBeneficiariesByPartnerObject[]>(
				"totalBeneficiariesByPartnerWithoutUs",
				totalBeneficiariesByPartnerWithoutUsUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<TotalBeneficiariesBySectorObject[]>(
				"totalBeneficiariesBySectorWithoutUs",
				totalBeneficiariesBySectorWithoutUsUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<AllocationsByYearAndFundObject[]>(
				"allocationsByYearAndFundWithUS",
				allocationsByYearAndFundUrlWithUS,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<AllocationsByYearAndFundObject[]>(
				"allocationsByYearAndFundWithoutUS",
				allocationsByYearAndFundUrlWithoutUS,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<AllocationTypesMasterObject[]>(
				"allocationTypesMaster",
				allocationTypesMasterUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<OrganizationMasterObject[]>(
				"organizationMaster",
				organizationMasterUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFile<PooledFundsMasterObject[]>(
				"pooledFundsMaster",
				pooledFundsMasterUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFile<SectorsMasterObject[]>(
				"sectorsMaster",
				sectorsMasterUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFile<OrganizationTypesMasterObject[]>(
				"organizationTypesMaster",
				organizationTypesMasterUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFile<AllocationSourcesMasterObject[]>(
				"allocationSourcesMaster",
				allocationSourcesMasterUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFile<PooledFundsWithRegionMasterObject[]>(
				"pooledFundsWithRegionMaster",
				pooledFundWithRegionMasterUrl,
				"json",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFile<DonorsMasterObject[]>(
				"donorsMaster",
				donorsMaster,
				"csv",
			),
			progressStore.increment,
		),
	] as const;

	progressStore.reset(
		staticFetchPromises.length + dynamicFetchPromises.length,
	);

	const staticPromises = Promise.all(staticFetchPromises);
	const dynamicPromises = Promise.all(dynamicFetchPromises);

	return Promise.all([staticPromises, dynamicPromises])
		.then(([staticResults, dynamicContributionsResults]) =>
			receiveData(staticResults, dynamicContributionsResults),
		)
		.catch((error: unknown) => {
			console.error("Error fetching app data:", error);
			throw error;
		});

	function receiveData(
		[
			projectSummary,
			sectorsData,
			totalBeneficiaries,
			totalBeneficiariesByPartner,
			totalBeneficiariesBySector,
			totalBeneficiariesWithoutUs,
			totalBeneficiariesByPartnerWithoutUs,
			totalBeneficiariesBySectorWithoutUs,
			allocationsByYearAndFundWithUS,
			allocationsByYearAndFundWithoutUS,
			allocationTypesMaster,
			organizationMaster,
			pooledFundsMaster,
			sectorsMaster,
			organizationTypesMaster,
			allocationSourcesMaster,
			pooledFundsWithRegionMaster,
			donorsMaster,
		]: ReceiveDataArgs,
		dynamicContributionsResults: ContributionsJson[],
	): AppData {
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
				dynamicContributionsResults,
			});

		const {
			allocationsData,
			inAllocationsDataLists,
			totalBeneficiariesData,
			totalBeneficiariesByPartnerData,
			totalBeneficiariesBySectorData,
			localizationDataWithUS,
			localizationDataWithoutUS,
		} = processRawData({
			projectSummary,
			sectorsData,
			totalBeneficiaries,
			totalBeneficiariesByPartner,
			totalBeneficiariesBySector,
			totalBeneficiariesWithoutUs,
			totalBeneficiariesByPartnerWithoutUs,
			totalBeneficiariesBySectorWithoutUs,
			allocationsByYearAndFundWithUS,
			allocationsByYearAndFundWithoutUS,
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
			localizationDataWithUS,
			localizationDataWithoutUS,
			lists,
		};
	}
}
