function flipObject<
	K extends string | number | symbol,
	V extends string | number | symbol,
>(obj: Record<K, V>): Record<V, K> {
	const flipped = {} as Record<V, K>;

	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			flipped[obj[key]] = key;
		}
	}

	return flipped;
}

export default flipObject;
