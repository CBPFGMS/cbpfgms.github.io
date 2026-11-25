function toLocaleFixed(
	value: number,
	minFractionDigits: number,
	maximumFractionDigits: number
) {
	return value.toLocaleString(undefined, {
		minimumFractionDigits: minFractionDigits,
		maximumFractionDigits: maximumFractionDigits,
	});
}

export default toLocaleFixed;
