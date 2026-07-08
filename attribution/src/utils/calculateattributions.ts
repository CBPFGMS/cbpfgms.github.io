import type { ContributionsData } from "./processcontributionsdata";
import { simpleWarn } from "./warninvalid";

type AttributionObject = {
	total: number;
	donor: number;
	percentage: number;
};

type Attributions = {
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
}: CalculateAttributionsParams): Attributions {
	const attributions: Attributions = { global: 0 };

	if (contributionsData[donor]) {
		contributionsData[donor].forEach(datum => {
			attributions[datum.fund] = {
		});
	} else {
		simpleWarn(
			`Fatal error: Donor ID ${donor} not found in contributions data`,
		);
	}

	return attributions;
}

export default calculateAttributions;
