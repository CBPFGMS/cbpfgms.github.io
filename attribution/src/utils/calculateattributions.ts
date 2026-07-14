import type { ContributionsData } from "./processcontributionsdata";
import { constants } from "./constants";

const { USCode } = constants;

type AttributionObject = {
	total: number;
	donor: number;
	percentage: number;
};

export type Attributions = {
	[key: number]: AttributionObject;
} & { global: AttributionObject };

type CalculateAttributionsParams = {
	donor: number;
	contributionsData: ContributionsData;
	year: number;
	hasUS: boolean;
	funds: number[];
	allFunds: number[];
};

function calculateAttributions({
	donor,
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
		if (!hasUS && datum.donor === USCode) {
			return;
		}
		if (year === datum.year) {
			if (funds.includes(datum.fund)) {
				attributions.global.total += datum.contribution;
				if (datum.donor === donor) {
					attributions.global.donor += datum.contribution;
				}
			}

			if (allFunds.includes(datum.fund)) {
				if (!attributions[datum.fund]) {
					attributions[datum.fund] = {
						total: datum.contribution,
						donor: datum.donor === donor ? datum.contribution : 0,
						percentage: 0,
					};
				} else {
					attributions[datum.fund].total += datum.contribution;
					if (datum.donor === donor) {
						attributions[datum.fund].donor += datum.contribution;
					}
				}
			}
		}
	});

	for (const fund in attributions) {
		attributions[fund].percentage = attributions[fund].total
			? attributions[fund].donor / attributions[fund].total
			: 0;
	}

	return attributions;
}

export default calculateAttributions;
