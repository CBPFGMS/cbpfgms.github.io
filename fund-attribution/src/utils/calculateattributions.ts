import type { ContributionsData } from "./processcontributionsdata";

type AttributionObject = {
	total: number;
	fund: number;
	percentage: number;
};

export type Attributions = {
	[key: number]: AttributionObject;
} & { global: AttributionObject };

type CalculateAttributionsParams = {
	contributionsData: ContributionsData;
	year: number;
	hasUS: boolean;
	donors: number[];
	allDonors: number[];
};

function calculateAttributions({
	contributionsData,
	year,
	hasUS,
	donors,
	allDonors,
}: CalculateAttributionsParams): Attributions {
	const attributions: Attributions = {
		global: { total: 0, fund: 0, percentage: 0 },
	};

	contributionsData.forEach(datum => {
		if ((!hasUS && datum.hasUS) || (hasUS && !datum.hasUS)) {
			return;
		}
		if (year === datum.year) {
			const decimalPercentage = datum.percentage / 100;
			if (donors.includes(datum.donor)) {
				attributions.global.total += datum.totalContribution;
				attributions.global.fund += datum.contribution;
			}

			if (allDonors.includes(datum.donor)) {
				attributions[datum.donor] = {
					total: datum.totalContribution,
					fund: datum.contribution,
					percentage: decimalPercentage,
				};
			}
		}
	});

	attributions.global.percentage = attributions.global.total
		? attributions.global.fund / attributions.global.total
		: 0;


	return attributions;
}

export default calculateAttributions;
