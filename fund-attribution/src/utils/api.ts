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
import { constants } from "./constants";
import warnInvalidSchema, { simpleWarn } from "./warninvalid";
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
	dataHasNSFT: boolean;
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

type SettledFetches<T extends readonly Promise<unknown>[]> = {
	values: { -readonly [K in keyof T]: Awaited<T[K]> };
	errors: unknown[];
};

async function settleFetches<T extends readonly Promise<unknown>[]>(
	promises: T,
): Promise<SettledFetches<T>> {
	const results = await Promise.allSettled(promises);
	const errors: unknown[] = [];
	const values = results.map(result => {
		if (result.status === "rejected") {
			errors.push(result.reason);
			return undefined;
		}
		return result.value;
	}) as SettledFetches<T>["values"];

	return { values, errors };
}

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
	selectedFund: number,
): Promise<AppData> {
	const effectiveStartYear = startYear ?? currentYear;

	const contributionsBaseUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net/donor_attribution/api/public/contributions?";

	const yearsRangeArray = effectiveStartYear
		? generateRange(effectiveStartYear, currentYear, 1)
		: [currentYear];

	const contributionsUrlsWithoutUS = yearsRangeArray.map(
		year =>
			`${contributionsBaseUrl}year=${year}&pooledFundId=${selectedFund}&excludeUsa=1`,
	);

	const contributionsUrlsWithUS = yearsRangeArray.map(
		year =>
			`${contributionsBaseUrl}year=${year}&pooledFundId=${selectedFund}`,
	);

	const combinedContributionsUrls = [
		...contributionsUrlsWithoutUS,
		...contributionsUrlsWithUS,
	];

	const dynamicFetchPromises = combinedContributionsUrls.map((url, index) =>
		trackProgress(
			fetchFileDB<ContributionsJson>(
				`fund${selectedFund}_contributions${index}`,
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

	return Promise.all([
		settleFetches(staticFetchPromises),
		settleFetches(dynamicFetchPromises),
	]).then(([staticResults, dynamicResults]) => {
		const errors = [...staticResults.errors, ...dynamicResults.errors];
		if (errors.length) {
			throw new AggregateError(
				errors,
				"One or more data sources could not be loaded.",
			);
		}
		return receiveData(staticResults.values, dynamicResults.values);
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

		const { contributionsData, inContributionsDataLists, dataHasNSFT } =
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
			selectedFund,
			effectiveStartYear,
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
			projectClusterData: parseProjectClusterData(
				projectClusterOneGms,
				selectedFund,
				effectiveStartYear,
			),
			allocationsLollipopData: parseAllocationsLollipopData(
				allocationsLollipop,
				selectedFund,
				effectiveStartYear,
				lists,
			),
			allocationsLollipopWithoutUSData: parseAllocationsLollipopData(
				allocationsLollipopWithoutUS,
				selectedFund,
				effectiveStartYear,
				lists,
			),
			lists,
			dataHasNSFT,
		};
	}
}

//TODO: Instead of passing the cluster data to the component, pass it to processRawData and process it there, adding to the allocationsData.
function parseProjectClusterData(
	rows: ProjectClusterOneGmsObject[],
	selectedFund: number,
	effectiveStartYear: number,
): ProjectClusterOneGmsObject[] {
	const parsedRows: ProjectClusterOneGmsObject[] = [];

	rows.forEach(row => {
		const parsedRow = projectClusterOneGmsObjectSchema.safeParse(row);
		if (parsedRow.success) {
			//keep just the fund of the attribution page. Also, remove year data before the selected start year
			if (
				row.PooledFundId !== selectedFund &&
				row.AllocationYear < effectiveStartYear
			) {
				return;
			}

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

//TODO: Instead of passing the lollipo data to the component, pass it to processRawData and process it there, adding to the allocationsData.
function parseAllocationsLollipopData(
	rows: AllocationsLollipopObject[],
	selectedFund: number,
	effectiveStartYear: number,
	lists: List,
): AllocationsLollipopObject[] {
	const parsedRows: AllocationsLollipopObject[] = [];

	rows.forEach(row => {
		const parsedRow = allocationsLollipopObjectSchema.safeParse(row);
		if (parsedRow.success) {
			const thisFundId = lists.fundIdsByName[row.PooledFundName];

			if (!thisFundId) {
				simpleWarn(
					`Fund with name ${row.PooledFundName} not found in the funds master`,
				);
				return;
			}

			//keep just the fund of the attribution page. Also, remove year data before the selected start year
			if (
				thisFundId !== selectedFund ||
				row.AllocationYear < effectiveStartYear
			) {
				return;
			}

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
