import { constants } from "./constants";

const {
	percentageDecimalPlaces,
	minimumPercentageValue,
	minimumPercentageValueForDisplay,
} = constants;

function truncatePercentage(value: number): {
	truncatedPercentage: number;
	truncatedPercentageForDisplay: number;
	lessThanMinimum: string;
} {
	const factor = Math.pow(10, percentageDecimalPlaces);

	//multiplying by 100 because the original value is a decimal
	const truncatedPercentage = Math.floor(value * factor * 100) / factor;

	const truncatedPercentageForDisplay =
		truncatedPercentage < minimumPercentageValue
			? 0
			: Math.max(truncatedPercentage, minimumPercentageValueForDisplay);
	const lessThanMinimum =
		value > 0 && truncatedPercentageForDisplay === 0
			? "less than " + minimumPercentageValue
			: "";

	return {
		truncatedPercentage,
		truncatedPercentageForDisplay,
		lessThanMinimum,
	};
}

export default truncatePercentage;
