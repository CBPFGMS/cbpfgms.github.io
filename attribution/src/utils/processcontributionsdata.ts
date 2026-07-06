import type { List } from "./makelists";
import { type ContributionsObject, contributionsObjectSchema } from "./schemas";
import warnInvalidSchema from "./warninvalid";

type ProcessContributionsDataParams = {
	contributions: ContributionsObject[];
	lists: List;
};

type donorDatum = {
	fund: number;
	year: number;
	contribution: number;
	percentage: number;
	nonGMSDonorCode: number;
};

export type ContributionsData = {
	[key: number]: donorDatum[];
};

export type InContributionsDataLists = {
	years: Set<number>;
	donors: Set<number>;
	fundsPerDonor: { [key: number]: Set<number> };
};

type SetType<T> = {
	[P in keyof T]: T[P] extends Set<infer U> ? U : never;
};

type InContributionsDataListsValues = SetType<InContributionsDataLists>;

function processContributionsData({
	contributions,
	lists,
}: ProcessContributionsDataParams): {
	contributionsData: ContributionsData;
	inContributionsDataLists: InContributionsDataLists;
} {
	const contributionsData: ContributionsData = {};

	const yearsSet: Set<InContributionsDataListsValues["years"]> = new Set();
	const donorsSet: Set<InContributionsDataListsValues["donors"]> = new Set();
	const fundsPerDonor: InContributionsDataLists["fundsPerDonor"] = {};

	contributions.forEach(row => {
		const parsedContributions = contributionsObjectSchema.safeParse(row);
		if (parsedContributions.success) {
			const thisDonor = row.GMSDonorId;

			lists.donorNonGMSNames[row.DonorCode] = row.DonorName;

			yearsSet.add(row.FiscalYear);
			donorsSet.add(thisDonor);
			if (!fundsPerDonor[thisDonor]) {
				fundsPerDonor[thisDonor] = new Set([row.PooledFundId]);
			} else {
				fundsPerDonor[thisDonor].add(row.PooledFundId);
			}

			const objDatum: donorDatum = {
				fund: row.PooledFundId,
				year: row.FiscalYear,
				contribution: row.ContributionAmt,
				percentage: row.ContributionPercent,
				nonGMSDonorCode: row.DonorCode,
			};

			if (!contributionsData[thisDonor]) {
				contributionsData[thisDonor] = [objDatum];
			} else {
				contributionsData[thisDonor].push(objDatum);
			}
		} else {
			warnInvalidSchema(
				"contributions",
				row,
				JSON.stringify(parsedContributions.error),
			);
		}
	});

	const inContributionsDataLists: InContributionsDataLists = {
		years: yearsSet,
		donors: donorsSet,
		fundsPerDonor,
	};

	return {
		contributionsData,
		inContributionsDataLists,
	};
}

export default processContributionsData;
