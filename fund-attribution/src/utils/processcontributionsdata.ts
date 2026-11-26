import { type ContributionsJson, contributionsObjectSchema } from "./schemas";
import warnInvalidSchema from "./warninvalid";

type ProcessContributionsDataParams = {
	dynamicContributionsResults: ContributionsJson[];
};

type fundDatum = {
	donor: number;
	year: number;
	contribution: number;
	totalContribution: number;
	percentage: number;
	hasUS: boolean;
};

export type ContributionsData = fundDatum[];

export type InContributionsDataLists = {
	years: Set<number>;
	donorsPerYear: { [year: number]: Set<number> };
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
	const donorsPerYear: InContributionsDataLists["donorsPerYear"] = {};

	dynamicContributionsResults.forEach(contribution => {
		const thisYear = contribution.meta.fiscalYear;

		if (contribution.pooledFunds[0] === undefined) {
			console.warn(
				`No contribution found for fund ${contribution.filters.pooledFundId} in year ${thisYear}`,
			);
			return;
		}

		yearsSet.add(thisYear);

		contribution.pooledFunds[0].donors.forEach(row => {
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

			if (!donorsPerYear[thisYear]) {
				donorsPerYear[thisYear] = new Set([row.donorId]);
			} else {
				donorsPerYear[thisYear].add(row.donorId);
			}

			contributionsData.push({
				donor: row.donorId,
				year: thisYear,
				contribution: row.attributedAmount,
				totalContribution: row.donorTotal,
				percentage: row.donorTotal
					? (row.attributedAmount / row.donorTotal) * 100
					: 0, //TODO: change for a calculated property
				hasUS: !contribution.meta.excludesUsa,
			});
		});
	});

	const inContributionsDataLists: InContributionsDataLists = {
		years: yearsSet,
		donorsPerYear: donorsPerYear,
	};

	return {
		contributionsData,
		inContributionsDataLists,
	};
}

export default processContributionsData;
