import fetchFile from "./fetchfile";
import fetchFileDB from "./fetchfiledb";
import type {
	ContributionsObject,
	RegionalFundsMasterJson,
	PooledFundsMasterObject,
} from "./schemas";
import makeLists, { type List } from "./makelists";
import processRawData, {
	type ContributionsData,
	type InContributionsDataLists,
} from "./processrawdata";
import { constants } from "./constants";

export type AppData = {
	contributionsData: ContributionsData;
	inContributionsDataLists: InContributionsDataLists;
	lists: List;
};

type ReceiveDataArgs = [
	ContributionsObject[],
	RegionalFundsMasterJson,
	PooledFundsMasterObject[],
];

const { currentYear } = constants;

const regionalFundsMasterUrl =
		"https://pfbi-eastus2-api-site.azurewebsites.net/donor_attribution/api/public/regional-funds",
	pooledFundsMasterUrl =
		"https://cbpfapi.unocha.org/vo2/odata/MstPooledFund?$format=csv";

export async function fetchAppData(startYear: number | null): Promise<AppData> {
	if (!startYear) {
		startYear = currentYear;
	}

	// const toYearQueryString =
	// 	startYear < currentYear ? `&FiscalYearTo=${currentYear}` : "";

	//TODO: Either have the API with YearFrom or get all years then filter in the client-side
	const contributionDataUrl = `https://cbpfapi.unocha.org/vo1/odata/Contribution?poolfundAbbrv=&year=${startYear}&$format=csv`;
	//void startYear;
	//FIX: Change this to fetch from the actual API when ready
	// const contributionDataUrl = "contr.csv";

	return Promise.all([
		fetchFileDB<ContributionsObject[]>(
			"contributions",
			contributionDataUrl,
			"csv",
		),
		fetchFile<RegionalFundsMasterJson>(
			"regionalFundsMaster",
			regionalFundsMasterUrl,
			"json",
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
		contributionsDataRaw,
		regionalFundsMaster,
		pooledFundsMaster,
	]: ReceiveDataArgs): AppData {
		const lists = makeLists({
			regionalFundsMaster,
			pooledFundsMaster,
		});

		const { contributionsData, inContributionsDataLists } = processRawData({
			contributionsDataRaw,
			lists,
		});

		return {
			contributionsData,
			inContributionsDataLists,
			lists,
		};
	}
}
