function reverseFormat(s: string | null): number {
	if (s === null || +s === 0) return 0;
	let returnValue: number = 0;
	const transformation = {
		Y: Math.pow(10, 24),
		Z: Math.pow(10, 21),
		E: Math.pow(10, 18),
		P: Math.pow(10, 15),
		T: Math.pow(10, 12),
		G: Math.pow(10, 9),
		B: Math.pow(10, 9),
		M: Math.pow(10, 6),
		k: Math.pow(10, 3),
		h: Math.pow(10, 2),
		da: Math.pow(10, 1),
		d: Math.pow(10, -1),
		c: Math.pow(10, -2),
		m: Math.pow(10, -3),
		μ: Math.pow(10, -6),
		n: Math.pow(10, -9),
		p: Math.pow(10, -12),
		f: Math.pow(10, -15),
		a: Math.pow(10, -18),
		z: Math.pow(10, -21),
		y: Math.pow(10, -24),
	};
	Object.keys(transformation).some(k => {
		if (s.indexOf(k) > 0) {
			returnValue =
				parseFloat(s.split(k)[0]) *
				transformation[k as keyof typeof transformation];
			return true;
		}
	});
	if (returnValue === 0) returnValue = parseFloat(s);
	return returnValue;
}

export default reverseFormat;
