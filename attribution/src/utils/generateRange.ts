function generateRange(start: number, end: number, step: number = 1): number[] {
	const output: number[] = [];
	for (let i = start; i <= end; i += step) {
		output.push(i);
	}
	return output;
}

export default generateRange;
