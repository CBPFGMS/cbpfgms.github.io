import fetchFile from "./fetchfile";
import fetchFileDB from "./fetchfiledb";
import type { ContributionsObject, RegionalFundsMasterObject } from "./schemas";
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

type ReceiveDataArgs = [ContributionsObject[], RegionalFundsMasterObject[]];

const { currentYear } = constants;

const regionalFundsMasterUrl =
	"https://cbpfgms.github.io/pfbi-data/mst/MstRhpf.json";

export async function fetchAppData(startYear: number | null): Promise<AppData> {
	if (!startYear) {
		startYear = currentYear;
	}

	const toYearQueryString =
		startYear < currentYear ? `&FiscalYearTo=${currentYear}` : "";

	const contributionDataUrl = `https://cbpfapi.unocha.org/vo2/odata/ContributionTotal?FiscalYearFrom=${startYear}${toYearQueryString}&$format=csv`;

	return Promise.all([
		fetchFileDB<ContributionsObject[]>(
			"contributions",
			contributionDataUrl,
			"csv",
		),
		fetchFile<RegionalFundsMasterObject[]>(
			"regionalFundsMaster",
			regionalFundsMasterUrl,
			"json",
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
	]: ReceiveDataArgs): AppData {
		const lists = makeLists({
			regionalFundsMaster,
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
