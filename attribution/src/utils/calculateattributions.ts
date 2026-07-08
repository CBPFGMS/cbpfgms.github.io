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
};

function calculateAttributions({
	donor,
	contributionsData,
	year,
	hasUS,
	funds,
}: CalculateAttributionsParams): Attributions {
	const attributions: Attributions = {
		global: { total: 0, donor: 0, percentage: 0 },
	};

	console.log(contributionsData);
	console.log(funds);
	console.log(year);
	console.log(hasUS);
	console.log(donor);

	contributionsData.forEach(datum => {
		if (!hasUS && datum.donor === USCode) {
			return;
		}
		if (funds.includes(datum.fund) && year === datum.year) {
			attributions.global.total += datum.contribution;
			if (datum.donor === donor) {
				attributions.global.donor += datum.contribution;
			}

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
	});

	for (const fund in attributions) {
		attributions[fund].percentage =
			attributions[fund].donor / attributions[fund].total;
	}

	return attributions;
}

export default calculateAttributions;
