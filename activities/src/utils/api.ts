import fetchFile from "./fetchfile";
import fetchFileDB from "./fetchfiledb";
import type {
	PooledFundsMasterObject,
	ProjectSummaryAggregatedObject,
} from "./schemas";

export type AppData = {
	data: ProjectSummaryAggregatedObject[];
	pooledFundsMaster: PooledFundsMasterObject[];
};

type ReceiveDataArgs = [
	ProjectSummaryAggregatedObject[],
	PooledFundsMasterObject[],
];

const pooledFundsMasterUrl =
	"https://cbpfapib.unocha.org/vo2/odata/MstPooledFund?$format=csv";

export function fetchAppData(startYear: number | null): Promise<AppData> {
	const yearRange = startYear
		? `${startYear}_${new Date().getFullYear()}`
		: "";

	const projectSummaryAggregatedUrl = `https://cbpfapib.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=CBPF_Global_PROJ_SUMMARY_Agg_V3&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AdminLocationLevel=&AllocationYear=${yearRange}&$format=csv`;

	return Promise.all([
		fetchFileDB<ProjectSummaryAggregatedObject[]>(
			"projectSummaryAggregated",
			projectSummaryAggregatedUrl,
			"csv",
		),
		fetchFile<PooledFundsMasterObject[]>(
			"pooledFundsMaster",
			pooledFundsMasterUrl,
			"csv",
		),
	])
		.then(receiveData)
		.catch((error: unknown) => {
			console.error("Error fetching app data:", error);
			throw error;
		});

	function receiveData([
		projectSummaryAggregated,
		pooledFundsMaster,
	]: ReceiveDataArgs): AppData {
		return {
			data: projectSummaryAggregated,
			pooledFundsMaster,
		};
	}
}
