import { type ContributionsObject, contributionsObjectSchema } from "./schemas";
import type { List } from "./makelists";
import warnInvalidSchema from "./warninvalid";
import { constants } from "./constants";
import type { Tranche } from "../components/MainContainer";

type ProcessRawDataParams = {
	contributionsDataRaw: ContributionsObject[];
	lists: List;
};

export type TrancheNumbers = Exclude<Tranche, "all">;

type ContributionsDatum = {
	year: number;
	fundISOCode: string;
	fundName: string;
	paidAmount: number;
	pledgedAmount: number;
	totalAmount: number;
	tranche: TrancheNumbers;
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
		datum.DatePaid =
			Math.random() > 0.5
				? new Date("2026-08-01")
				: new Date("2026-06-01");

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

		lists.fundNames[datum.PooledFundISO2Code.toLowerCase()] =
			datum.PooledFundName;

		let fundsInYear = inContributionsData.fundsPerYear.get(
			datum.FiscalYear,
		);
		if (!fundsInYear) {
			fundsInYear = new Set<string>();
			inContributionsData.fundsPerYear.set(datum.FiscalYear, fundsInYear);
		}
		fundsInYear.add(datum.PooledFundISO2Code.toLowerCase());

		const parentRegionalFund =
			lists.parentRegionalFundForFund[datum.PooledFundName.toLowerCase()];

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
			fundsForRegionalFund.add(datum.PooledFundISO2Code.toLowerCase());
		}

		const thisTranche: TrancheNumbers =
			datum.DatePaid <= cutOffDate ? 1 : 2;

		contributionsData.push({
			year: datum.FiscalYear,
			fundISOCode: datum.PooledFundISO2Code.toLowerCase(),
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
