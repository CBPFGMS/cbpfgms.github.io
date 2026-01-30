import { formatPrefix } from "d3";

function formatSIFloat(value: number) {
	const length = (~~Math.log10(value) + 1) % 3;
	const digits = length === 1 ? 2 : length === 2 ? 1 : 0;
	const result = formatPrefix(
		"." + digits + "~",
		value
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
