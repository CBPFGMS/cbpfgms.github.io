import { type ContributionsJson, contributionsObjectSchema } from "./schemas";
import warnInvalidSchema from "./warninvalid";

type ProcessContributionsDataParams = {
	dynamicContributionsResults: ContributionsJson[];
};

type donorDatum = {
	fund: number;
	year: number;
	contribution: number;
	totalContribution: number;
	percentage: number;
	hasUS: boolean;
};

export type ContributionsData = donorDatum[];

export type InContributionsDataLists = {
	years: Set<number>;
	fundsPerYear: { [year: number]: Set<number> };
};

type SetType<T> = {
	[P in keyof T]: T[P] extends Set<infer U> ? U : never;
};

type InContributionsDataListsValues = SetType<InContributionsDataLists>;

function processContributionsData({
	dynamicContributionsResults,
}: ProcessContributionsDataParams): {
	contributionsData: ContributionsData;
	inContributionsDataLists: InContributionsDataLists;
} {
	const contributionsData: ContributionsData = [];

	const yearsSet: Set<InContributionsDataListsValues["years"]> = new Set();
	const fundsPerYear: InContributionsDataLists["fundsPerYear"] = {};

	dynamicContributionsResults.forEach(contribution => {
		const thisYear = contribution.meta.fiscalYear;

		if (contribution.donors[0] === undefined) {
			console.warn(
				`No contribution found for donor ${contribution.filters.donorId} in year ${thisYear}`,
			);
			return;
		}

		yearsSet.add(thisYear);

		contribution.donors[0].pooledFunds.forEach(row => {
			const parsedContributions =
				contributionsObjectSchema.safeParse(row);

			if (!parsedContributions.success) {
				warnInvalidSchema(
					`contributions-${thisYear}-withUS:${contribution.meta.excludesUsa}`,
					row,
					parsedContributions.error.message,
				);
				return;
			}

			if (row.isPassThrough) {
				return;
			}

			if (!fundsPerYear[thisYear]) {
				fundsPerYear[thisYear] = new Set([row.pooledFundId]);
			} else {
				fundsPerYear[thisYear].add(row.pooledFundId);
			}

			contributionsData.push({
				fund: row.pooledFundId,
				year: thisYear,
				contribution: row.attributedAmount,
				totalContribution: row.pooledFundTotal,
				percentage: row.shareOfFundPercent,
				hasUS: !contribution.meta.excludesUsa,
			});
		});
	});

	const inContributionsDataLists: InContributionsDataLists = {
		years: yearsSet,
		fundsPerYear,
	};

	return {
		contributionsData,
		inContributionsDataLists,
	};
}

export default processContributionsData;
