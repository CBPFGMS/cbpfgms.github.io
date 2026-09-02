import { type ContributionsObject, contributionsObjectSchema } from "./schemas";
import type { List } from "./makelists";
import warnInvalidSchema from "./warninvalid";
import { constants } from "./constants";

type ProcessRawDataParams = {
	contributionsDataRaw: ContributionsObject[];
	lists: List;
};

export type Tranche = 1 | 2;

type ContributionsDatum = {
	year: number;
	fundISOCode: string;
	fundName: string;
	paidAmount: number;
	pledgedAmount: number;
	totalAmount: number;
	tranche: Tranche;
};

export type ContributionsData = ContributionsDatum[];

type Year = number;

export type InContributionsDataLists = {
	years: Set<number>;
	fundsPerYear: Map<Year, Set<string>>;
	fundsPerYearAndRegionalFund: Map<Year, Map<string, Set<string>>>;
};

const { cutOffDate } = constants;

function processRawData({
	contributionsDataRaw,
	lists,
}: ProcessRawDataParams): {
	contributionsData: ContributionsData;
	inContributionsDataLists: InContributionsDataLists;
} {
	const contributionsData: ContributionsData = [];
	const inContributionsData: InContributionsDataLists = {
		years: new Set(),
		fundsPerYear: new Map(),
		fundsPerYearAndRegionalFund: new Map(),
	};

	contributionsDataRaw.forEach(datum => {
		//FIX: temporaryly creating a date value
		datum.DatePaid = new Date("2026-01-01");

		const parsedDatum = contributionsObjectSchema.safeParse(datum);

		if (!parsedDatum.success) {
			const shouldWarn = parsedDatum.error.issues.some(issue => {
				const isNotUsError =
					issue.path.length === 1 &&
					issue.path[0] === "GMSDonorISO2Code" &&
					issue.message === "not-US";
				return !isNotUsError;
			});

			if (shouldWarn) {
				warnInvalidSchema(
					"contributionsDataRaw",
					datum,
					parsedDatum.error.message,
				);
			}
			return;
		}

		inContributionsData.years.add(datum.FiscalYear);

		let fundsInYear = inContributionsData.fundsPerYear.get(
			datum.FiscalYear,
		);
		if (!fundsInYear) {
			fundsInYear = new Set<string>();
			inContributionsData.fundsPerYear.set(datum.FiscalYear, fundsInYear);
		}
		fundsInYear.add(datum.PooledFundISO2Code);

		const parentRegionalFund =
			lists.parentRegionalFundForFund[datum.PooledFundName];

		if (parentRegionalFund) {
			let fundsInYearAndRegionalFund =
				inContributionsData.fundsPerYearAndRegionalFund.get(
					datum.FiscalYear,
				);
			if (!fundsInYearAndRegionalFund) {
				fundsInYearAndRegionalFund = new Map<string, Set<string>>();
				inContributionsData.fundsPerYearAndRegionalFund.set(
					datum.FiscalYear,
					fundsInYearAndRegionalFund,
				);
			}
			let fundsForRegionalFund =
				fundsInYearAndRegionalFund.get(parentRegionalFund);
			if (!fundsForRegionalFund) {
				fundsForRegionalFund = new Set<string>();
				fundsInYearAndRegionalFund.set(
					parentRegionalFund,
					fundsForRegionalFund,
				);
			}
			fundsForRegionalFund.add(datum.PooledFundISO2Code);
		}

		const thisTranche: Tranche = datum.DatePaid <= cutOffDate ? 1 : 2;

		contributionsData.push({
			year: datum.FiscalYear,
			fundISOCode: datum.PooledFundISO2Code,
			fundName: datum.PooledFundName,
			paidAmount: datum.PaidAmt,
			pledgedAmount: datum.PledgeAmt,
			totalAmount: datum.PaidAmt + datum.PledgeAmt,
			tranche: thisTranche,
		});
	});

	return {
		contributionsData,
		inContributionsDataLists: inContributionsData,
	};
}

export default processRawData;
