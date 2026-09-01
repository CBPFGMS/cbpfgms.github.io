import type { ContributionsData } from "./processcontributionsdata";

type AttributionObject = {
	total: number;
	donor: number;
	percentage: number;
};

export type Attributions = {
	[key: number]: AttributionObject;
} & { global: AttributionObject };

type CalculateAttributionsParams = {
	contributionsData: ContributionsData;
	year: number;
	hasUS: boolean;
	funds: number[];
	allFunds: number[];
};

function calculateAttributions({
	contributionsData,
	year,
	hasUS,
	funds,
	allFunds,
}: CalculateAttributionsParams): Attributions {
	const attributions: Attributions = {
		global: { total: 0, donor: 0, percentage: 0 },
	};

	contributionsData.forEach(datum => {
		if ((!hasUS && datum.hasUS) || (hasUS && !datum.hasUS)) {
			return;
		}
		if (year === datum.year) {
			const decimalPercentage = datum.percentage / 100;
			if (funds.includes(datum.fund)) {
				attributions.global.total += datum.totalContribution;
				attributions.global.donor += datum.contribution;
			}

			if (allFunds.includes(datum.fund)) {
				attributions[datum.fund] = {
					total: datum.totalContribution,
					donor: datum.contribution,
					percentage: decimalPercentage,
				};
			}
		}
	});

	attributions.global.percentage = attributions.global.total
		? attributions.global.donor / attributions.global.total
		: 0;

	return attributions;
}

export default calculateAttributions;
