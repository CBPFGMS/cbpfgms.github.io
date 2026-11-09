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
	ProjectClusterOneGmsObject,
	SectorBeneficiaryObject,
	TotalBeneficiariesObject,
	TotalBeneficiariesByPartnerObject,
	TotalBeneficiariesBySectorObject,
	AllocationsByYearAndFundObject,
	AllocationsLollipopObject,
} from "./schemas";
import {
	allocationsLollipopObjectSchema,
	projectClusterOneGmsObjectSchema,
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
import warnInvalidSchema from "./warninvalid";
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
	projectClusterData: ProjectClusterOneGmsObject[];
	lists: List;
	allocationsLollipopData: AllocationsLollipopObject[];
	allocationsLollipopWithoutUSData: AllocationsLollipopObject[];
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
	ProjectClusterOneGmsObject[],
	AllocationsLollipopObject[],
	AllocationsLollipopObject[],
];

const { currentYear } = constants;

const baseUrl =
	"https://raw.githubusercontent.com/CBPFGMS/cbpfgms-data/master/utils/attribution/data/";

const pooledFundsMasterUrl = baseUrl + "MstPooledFund.csv",
	allocationSourcesMasterUrl = baseUrl + "MstAllocationSource.csv",
	organizationTypesMasterUrl = baseUrl + "MstOrgType.csv",
	sectorsMasterUrl = baseUrl + "MstClusters.csv",
	pooledFundWithRegionMasterUrl = baseUrl + "MstRegions.json",
	donorsMaster = baseUrl + "MstDonors.csv",
	totalBeneficiariesUrl = baseUrl + "TotalBeneficiaries.csv",
	totalBeneficiariesByPartnerUrl =
		baseUrl + "TotalBeneficiariesByPartner.csv",
	totalBeneficiariesBySectorUrl = baseUrl + "TotalBeneficiariesBySector.csv",
	totalBeneficiariesWithoutUsUrl =
		baseUrl + "TotalBeneficiariesWithoutUS.csv",
	totalBeneficiariesByPartnerWithoutUsUrl =
		baseUrl + "TotalBeneficiariesByPartnerWithoutUS.csv",
	totalBeneficiariesBySectorWithoutUsUrl =
		baseUrl + "TotalBeneficiariesBySectorWithoutUS.csv",
	projectClusterOneGmsUrl = baseUrl + "ProjectCluster.csv",
	allocationsByYearAndFundUrlWithUS =
		baseUrl + "AllocationsByYearAndFund.csv",
	allocationsByYearAndFundUrlWithoutUS =
		baseUrl + "AllocationsByYearAndFundWithoutUS.csv",
	projectSummaryUrl = baseUrl + "ProjectSummary.csv",
	sectorsDataUrl = baseUrl + "SectorsData.csv",
	allocationTypesMasterUrl = baseUrl + "MstAllocationsTypes.csv",
	organizationMasterUrl = baseUrl + "MstOrganizations.csv",
	allocationLollipopUrl = baseUrl + "AllocationsLollipop.csv",
	allocationLollipopWithoutUSUrl =
		baseUrl + "AllocationsLollipopWithoutUS.csv";

export async function fetchAppData(
	startYear: number | null,
	selectedDonor: number,
): Promise<AppData> {
	if (!startYear) {
		startYear = currentYear;
	}

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
			fetchFileDB<PooledFundsMasterObject[]>(
				"pooledFundsMaster",
				pooledFundsMasterUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<SectorsMasterObject[]>(
				"sectorsMaster",
				sectorsMasterUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<OrganizationTypesMasterObject[]>(
				"organizationTypesMaster",
				organizationTypesMasterUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<AllocationSourcesMasterObject[]>(
				"allocationSourcesMaster",
				allocationSourcesMasterUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<PooledFundsWithRegionMasterObject[]>(
				"pooledFundsWithRegionMaster",
				pooledFundWithRegionMasterUrl,
				"json",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<DonorsMasterObject[]>(
				"donorsMaster",
				donorsMaster,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<ProjectClusterOneGmsObject[]>(
				"projectClusterOneGms",
				projectClusterOneGmsUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<AllocationsLollipopObject[]>(
				"allocationLollipop",
				allocationLollipopUrl,
				"csv",
			),
			progressStore.increment,
		),
		trackProgress(
			fetchFileDB<AllocationsLollipopObject[]>(
				"allocationLollipopWithoutUS",
				allocationLollipopWithoutUSUrl,
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
			projectClusterOneGms,
			allocationsLollipop,
			allocationsLollipopWithoutUS,
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
			projectClusterData: parseProjectClusterData(projectClusterOneGms),
			allocationsLollipopData:
				parseAllocationsLollipopData(allocationsLollipop),
			allocationsLollipopWithoutUSData: parseAllocationsLollipopData(
				allocationsLollipopWithoutUS,
			),
			lists,
		};
	}
}

//TODO: Instead of passing the cluster data to the component, pass it to processRawData and process it there, adding to the allocationsData.
function parseProjectClusterData(
	rows: ProjectClusterOneGmsObject[],
): ProjectClusterOneGmsObject[] {
	const parsedRows: ProjectClusterOneGmsObject[] = [];

	rows.forEach(row => {
		const parsedRow = projectClusterOneGmsObjectSchema.safeParse(row);
		if (parsedRow.success) {
			parsedRows.push(parsedRow.data);
		} else {
			warnInvalidSchema(
				"projectClusterOneGms",
				row,
				parsedRow.error.message,
			);
		}
	});

	return parsedRows;
}

function parseAllocationsLollipopData(
	rows: AllocationsLollipopObject[],
): AllocationsLollipopObject[] {
	const parsedRows: AllocationsLollipopObject[] = [];

	rows.forEach(row => {
		const parsedRow = allocationsLollipopObjectSchema.safeParse(row);
		if (parsedRow.success) {
			parsedRows.push(parsedRow.data);
		} else {
			warnInvalidSchema(
				"allocationsLollipop",
				row,
				parsedRow.error.message,
			);
		}
	});

	return parsedRows;
}
