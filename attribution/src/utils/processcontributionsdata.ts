import type { List } from "./makelists";
import { type ContributionsObject, contributionsObjectSchema } from "./schemas";
import warnInvalidSchema, { simpleWarn } from "./warninvalid";
import { constants } from "./constants";
import { flagsCDNList } from "../assets/flagscdnlist";

const { currentYear } = constants;

type ProcessContributionsDataParams = {
	contributions: ContributionsObject[];
	lists: List;
	startYear: number | null;
};

type donorDatum = {
	fund: number;
	year: number;
	contribution: number;
	percentage: number;
	donor: number;
};

export type ContributionsData = donorDatum[];

export type InContributionsDataLists = {
	years: Set<number>;
	donors: Set<number>;
	fundsPerDonorAndYear: { [key: number]: { [key: number]: Set<number> } };
	yearsPerDonor: { [key: number]: Set<number> };
	missingFlags: string[];
};

type SetType<T> = {
	[P in keyof T]: T[P] extends Set<infer U> ? U : never;
};

type InContributionsDataListsValues = SetType<InContributionsDataLists>;

function processContributionsData({
	contributions,
	lists,
	startYear,
}: ProcessContributionsDataParams): {
	contributionsData: ContributionsData;
	inContributionsDataLists: InContributionsDataLists;
} {
	const contributionsData: ContributionsData = [];

	const yearsSet: Set<InContributionsDataListsValues["years"]> = new Set();
	const donorsSet: Set<InContributionsDataListsValues["donors"]> = new Set();
	const fundsPerDonorAndYear: InContributionsDataLists["fundsPerDonorAndYear"] =
		{};
	const yearsPerDonor: InContributionsDataLists["yearsPerDonor"] = {};

	contributions.forEach(row => {
		const parsedContributions = contributionsObjectSchema.safeParse(row);
		if (parsedContributions.success) {
			if (startYear && row.FiscalYear < startYear) {
				return;
			}

			//No attribution for future donations
			if (row.FiscalYear > currentYear) {
				return;
			}

			const thisDonor = row.GMSDonorId;

			lists.donorNonGMSNames[row.DonorCode] = row.DonorName;

			yearsSet.add(row.FiscalYear);
			donorsSet.add(thisDonor);
			if (!fundsPerDonorAndYear[thisDonor]) {
				fundsPerDonorAndYear[thisDonor] = {};
				fundsPerDonorAndYear[thisDonor][row.FiscalYear] = new Set([
					row.PooledFundId,
				]);
				yearsPerDonor[thisDonor] = new Set([row.FiscalYear]);
			} else {
				if (!fundsPerDonorAndYear[thisDonor][row.FiscalYear]) {
					fundsPerDonorAndYear[thisDonor][row.FiscalYear] = new Set([
						row.PooledFundId,
					]);
				} else {
					fundsPerDonorAndYear[thisDonor][row.FiscalYear].add(
						row.PooledFundId,
					);
				}
				yearsPerDonor[thisDonor].add(row.FiscalYear);
			}

			contributionsData.push({
				fund: row.PooledFundId,
				year: row.FiscalYear,
				contribution: row.ContributionAmt,
				percentage: row.ContributionPercent,
				donor: row.GMSDonorId,
			});
		} else {
			warnInvalidSchema(
				"contributions",
				row,
				parsedContributions.error.message,
			);
		}
	});

	const missingFlags = Array.from(donorsSet).reduce<string[]>((acc, curr) => {
		const donorIsoCode = lists.donorISO2Codes[curr]!.toLowerCase();
		if (!flagsCDNList[donorIsoCode]) {
			acc.push(donorIsoCode);
		}
		return acc;
	}, []);

	simpleWarn(
		`The following donors are missing flags: ${missingFlags.join(", ")}`,
	);

	const inContributionsDataLists: InContributionsDataLists = {
		years: yearsSet,
		donors: donorsSet,
		fundsPerDonorAndYear,
		yearsPerDonor,
		missingFlags,
	};

	return {
		contributionsData,
		inContributionsDataLists,
	};
}

export default processContributionsData;
