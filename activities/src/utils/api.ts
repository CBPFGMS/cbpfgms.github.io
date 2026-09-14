import fetchFile from "./fetchfile";
import fetchFileDB from "./fetchfiledb";
import type {
	PooledFundsMasterObject,
	ProjectSummaryAggregatedObject,
	ProjectSummaryObject,
	ActivitiesObject,
	SectorsMasterObject,
	OrganizationTypesMasterObject,
	AllocationSourcesMasterObject,
	ActivitiesMasterObject,
	TemplatesMasterJson,
} from "./schemas";
import makeLists, { type List } from "./makelists";
import processRawData, { type InDataLists, type Data } from "./processrawdata";

export type AppData = {
	data: Data;
	inDataLists: InDataLists;
	lists: List;
};

type ReceiveDataArgs = [
	ProjectSummaryAggregatedObject[],
	ProjectSummaryObject[],
	ActivitiesObject[],
	PooledFundsMasterObject[],
	SectorsMasterObject[],
	OrganizationTypesMasterObject[],
	AllocationSourcesMasterObject[],
	ActivitiesMasterObject[],
	TemplatesMasterJson,
];

const baseUrl =
	"https://raw.githubusercontent.com/CBPFGMS/cbpfgms-data/master/utils/FT_allocations_overview_static/data/";

const pooledFundsMasterUrl = `${baseUrl}MstPooledFund.csv`,
	sectorsMasterUrl = `${baseUrl}MstClusters.csv`,
	organizationTypesMasterUrl = `${baseUrl}MstOrgType.csv`,
	allocationSourcesMasterUrl = `${baseUrl}MstAllocationSource.csv`,
	activitiesMasterUrl = `${baseUrl}MstActivities.csv`;

const templatesMasterUrl =
	"https://pfbi-eastus2-api-site.azurewebsites.net/bdt2/api/public/v1/templates/?includeProjectCode=1";

export async function fetchAppData(startYear: number | null): Promise<AppData> {
	// const yearRange = startYear
	// 	? `${startYear}_${new Date().getFullYear()}`
	// 	: "";

	const projectSummaryUrl = `${baseUrl}ProjectSummaryV2_${startYear}.csv`;

	const projectSummaryAggregatedUrl = `${baseUrl}ProjectSummaryAggV2_${startYear}.csv`;

	const activitiesUrl = `${baseUrl}LocationActivities_${startYear}.csv`;

	return Promise.all([
		fetchFileDB<ProjectSummaryAggregatedObject[]>(
			"projectSummaryAggregated",
			projectSummaryAggregatedUrl,
			"csv",
		),
		fetchFileDB<ProjectSummaryObject[]>(
			"projectSummary",
			projectSummaryUrl,
			"csv",
		),
		fetchFileDB<ActivitiesObject[]>("activities", activitiesUrl, "csv"),
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
		fetchFile<ActivitiesMasterObject[]>(
			"activitiesMaster",
			activitiesMasterUrl,
			"csv",
		),
		fetchFile<TemplatesMasterJson>(
			"templatesMaster",
			templatesMasterUrl,
			"json",
		),
	])
		.then(receiveData)
		.catch((error: unknown) => {
			console.error("Error fetching app data:", error);
			throw error;
		});

	function receiveData([
		projectSummaryAggregated,
		projectSummary,
		activities,
		pooledFundsMaster,
		sectorsMaster,
		organizationTypesMaster,
		allocationSourcesMaster,
		activitiesMaster,
		templatesMaster,
	]: ReceiveDataArgs): AppData {
		const lists = makeLists({
			pooledFundsMaster,
			allocationSourcesMaster,
			organizationTypesMaster,
			sectorsMaster,
			activitiesMaster,
		});

		const { data, inDataLists } = processRawData({
			projectSummaryAggregated,
			projectSummary,
			activities,
			lists,
			templatesMaster,
		});

		return {
			data,
			inDataLists,
			lists,
		};
	}
}
