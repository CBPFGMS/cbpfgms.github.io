import type { ContributionsData } from "./processcontributionsdata";

type AttributionObject = {
	total: number;
	fund: number;
	percentage: number;
	fundPercentage: number;
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

function roundWithEpsilon(num: number): number {
	return Math.round((num + Number.EPSILON) * 1e4) / 1e4;
}

function calculateAttributions({
	contributionsData,
	year,
	hasUS,
	donors,
	allDonors,
}: CalculateAttributionsParams): Attributions {
	const attributions: Attributions = {
		global: { total: 0, fund: 0, percentage: 0, fundPercentage: 0 },
	};

	contributionsData.forEach(datum => {
		if ((!hasUS && datum.hasUS) || (hasUS && !datum.hasUS)) {
			return;
		}
		if (year === datum.year) {
			if (donors.includes(datum.donor)) {
				attributions.global.total += datum.totalContribution;
				attributions.global.fund += datum.contribution;
				attributions.global.fundPercentage +=
					datum.fundPercentage / 100;
			}

			if (allDonors.includes(datum.donor)) {
				attributions[datum.donor] = {
					total: datum.totalContribution,
					fund: datum.contribution,
					percentage: roundWithEpsilon(datum.percentage / 100),
					fundPercentage: roundWithEpsilon(
						datum.fundPercentage / 100,
					),
				};
			}
		}
	});

	attributions.global.percentage = attributions.global.total
		? roundWithEpsilon(attributions.global.fund / attributions.global.total)
		: 0;

	attributions.global.fundPercentage = roundWithEpsilon(
		attributions.global.fundPercentage,
	);

	console.log(attributions.global.fundPercentage);

	return attributions;
}

export default calculateAttributions;
