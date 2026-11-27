import { type ContributionsJson, contributionsObjectSchema } from "./schemas";
import warnInvalidSchema from "./warninvalid";
import { constants } from "./constants";

const { firstNSFTYear } = constants;

type ProcessContributionsDataParams = {
	dynamicContributionsResults: ContributionsJson[];
};

type fundDatum = {
	donor: number;
	year: number;
	contribution: number;
	totalContribution: number;
	percentage: number;
	fundPercentage: number;
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

type DataSizeTRacker = {
	[year: number]: number[];
};

function processContributionsData({
	dynamicContributionsResults,
}: ProcessContributionsDataParams): {
	contributionsData: ContributionsData;
	inContributionsDataLists: InContributionsDataLists;
	dataHasNSFT: boolean;
} {
	const contributionsData: ContributionsData = [];

	const dataSizeTracker: DataSizeTRacker = {};

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

		const tracker = (dataSizeTracker[thisYear] ??= []);
		tracker.push(contribution.pooledFunds[0].donors.length);

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
				percentage: row.attributedPercent,
				fundPercentage: row.shareOfFundPercent,
				hasUS: !contribution.meta.excludesUsa,
			});
		});
	});

	const dataHasNSFT = Object.entries(dataSizeTracker).some(
		([key, value]) => +key >= firstNSFTYear && value[0] !== value[1],
	);

	const inContributionsDataLists: InContributionsDataLists = {
		years: yearsSet,
		donorsPerYear: donorsPerYear,
	};

	return {
		contributionsData,
		inContributionsDataLists,
		dataHasNSFT,
	};
}

export default processContributionsData;
