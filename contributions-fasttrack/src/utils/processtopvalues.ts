import type { Tranche } from "../components/MainContainer";
import type { List } from "./makelists";
import type { ContributionType } from "../components/MainContainer";
import type { ContributionsData } from "./processrawdata";
import { constants } from "../utils/constants";

type ProcessTopValuesParams = {
	contributionsData: ContributionsData;
	lists: List;
	year: number;
	tranche: Tranche;
};

export type TopValuesData = {
	[type in ContributionType]: TopValuesDatum;
};

type RegionalFund = string;

export type TopValuesDatum = {
	value: number;
	cbpfs: Set<string>;
	fundsPerRegionalFund: Map<RegionalFund, Set<string>>;
};

const { contributionTypes } = constants;

function processTopValues({
	contributionsData,
	lists,
	year,
	tranche,
}: ProcessTopValuesParams): TopValuesData {
	const topValuesData: TopValuesData = contributionTypes.reduce(
		(acc, type) => {
			acc[type] = {
				value: 0,
				cbpfs: new Set(),
				fundsPerRegionalFund: new Map(),
			};
			return acc;
		},
		{} as TopValuesData,
	);

	contributionsData.forEach(datum => {
		if (
			datum.year === year &&
			(tranche === "all" || datum.tranche === tranche)
		) {
			contributionTypes.forEach(type => {
				populateValuesData(topValuesData[type], datum, type, lists);
			});
		}
	});

	return topValuesData;
}

function populateValuesData(
	topValuesDatum: TopValuesDatum,
	datum: ContributionsData[number],
	type: ContributionType,
	lists: List,
) {
	const thisValue =
		type === "total"
			? datum.totalAmount
			: type === "paid"
				? datum.paidAmount
				: datum.pledgedAmount;

	if (thisValue === 0) {
		return;
	}

	topValuesDatum.value += thisValue;

	const regionalFund =
		lists.parentRegionalFundForFund[datum.fundName.toLowerCase()];

	if (regionalFund === undefined) {
		topValuesDatum.cbpfs.add(datum.fundISOCode);
	} else {
		let fundsInRegionalFund =
			topValuesDatum.fundsPerRegionalFund.get(regionalFund);
		if (!fundsInRegionalFund) {
			fundsInRegionalFund = new Set();
			topValuesDatum.fundsPerRegionalFund.set(
				regionalFund,
				fundsInRegionalFund,
			);
		}
		fundsInRegionalFund.add(datum.fundISOCode);
	}
}

export default processTopValues;
