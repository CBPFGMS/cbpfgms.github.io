import { formatPrefix } from "d3";

function formatSIFloat(value: number): string {
	//safeguard for zero and negative numbers
	if (value <= 0) return "0";

	const length = (Math.floor(Math.log10(value)) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	const result = formatPrefix(
		"." + digits + "~",
		value,
	)(value).replace("G", "B");
	if (parseInt(result) === 1000) {
		const lastDigit = result[result.length - 1];
		const units = { k: "M", M: "B" };
		return (
			1 +
			(isNaN(+lastDigit) ? units[lastDigit as keyof typeof units] : "")
		);
	}
	return result;
}

export default formatSIFloat;
