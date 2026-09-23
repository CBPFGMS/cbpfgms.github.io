import { type ContributionsObject, contributionsObjectSchema } from "./schemas";
import type { List } from "./makelists";
import warnInvalidSchema from "./warninvalid";
import { constants } from "./constants";
import type { Tranche } from "../components/MainContainer";
import parseApiDate from "./parseapidate";

type ProcessRawDataParams = {
	contributionsDataRaw: ContributionsObject[];
	lists: List;
};

export type TrancheNumbers = Exclude<Tranche, "all">;

type ContributionsDatum = {
	year: number;
	fund: number;
	paidAmount: number;
	pledgedAmount: number;
	totalAmount: number;
	tranche: TrancheNumbers;
};

export type ContributionsData = ContributionsDatum[];

type Year = number;

export type InContributionsDataLists = {
	years: Set<number>;
	fundsPerYear: Map<Year, Set<number>>;
	fundsPerYearAndRegionalFund: Map<Year, Map<string, Set<number>>>;
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
		const parsedDatum = contributionsObjectSchema.safeParse(datum);

		if (!parsedDatum.success) {
			const shouldWarn = parsedDatum.error.issues.some(issue => {
				const isNotUsError =
					issue.path.length === 1 &&
					issue.path[0] === "GMSDonorID" &&
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

		const thisDate = parseApiDate(datum.PaidDate);

		inContributionsData.years.add(datum.FiscalYear);

		let fundsInYear = inContributionsData.fundsPerYear.get(
			datum.FiscalYear,
		);
		if (!fundsInYear) {
			fundsInYear = new Set<number>();
			inContributionsData.fundsPerYear.set(datum.FiscalYear, fundsInYear);
		}
		fundsInYear.add(datum.PooledFundId);

		const parentRegionalFund =
			lists.parentRegionalFundForFund[datum.PooledFundId];

		if (parentRegionalFund) {
			let fundsInYearAndRegionalFund =
				inContributionsData.fundsPerYearAndRegionalFund.get(
					datum.FiscalYear,
				);
			if (!fundsInYearAndRegionalFund) {
				fundsInYearAndRegionalFund = new Map<string, Set<number>>();
				inContributionsData.fundsPerYearAndRegionalFund.set(
					datum.FiscalYear,
					fundsInYearAndRegionalFund,
				);
			}
			let fundsForRegionalFund =
				fundsInYearAndRegionalFund.get(parentRegionalFund);
			if (!fundsForRegionalFund) {
				fundsForRegionalFund = new Set<number>();
				fundsInYearAndRegionalFund.set(
					parentRegionalFund,
					fundsForRegionalFund,
				);
			}
			fundsForRegionalFund.add(datum.PooledFundId);
		}

		// This is the logic for determining the tranche based on the paid date and cut-off date:
		// if the paid date is after the cut-off date and the paid amount is greater than 0, it belongs to tranche 2; otherwise, it belongs to tranche 1
		const thisTranche: TrancheNumbers =
			thisDate && datum.PaidAmt > 0 && thisDate > cutOffDate ? 2 : 1;

		// In this API, pledged amounts are only considered if the paid amount is zero.
		const thisPledgedAmount = datum.PaidAmt === 0 ? datum.PledgeAmt : 0;

		contributionsData.push({
			year: datum.FiscalYear,
			fund: datum.PooledFundId,
			paidAmount: datum.PaidAmt,
			pledgedAmount: thisPledgedAmount,
			totalAmount: datum.PaidAmt + thisPledgedAmount,
			tranche: thisTranche,
		});
	});

	return {
		contributionsData,
		inContributionsDataLists: inContributionsData,
	};
}

export default processRawData;
