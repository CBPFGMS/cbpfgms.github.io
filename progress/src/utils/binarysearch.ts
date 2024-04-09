function binarySearch<T>(
	arr: T[],
	target: number,
	propertyName: keyof T
): number {
	let left = 0;
	let right = arr.length - 1;

	while (left <= right) {
		const mid = Math.floor((left + right) / 2);

		if ((arr[mid][propertyName] as number) === target) {
			return mid;
		} else if ((arr[mid][propertyName] as number) < target) {
			left = mid + 1;
		} else {
			right = mid - 1;
		}
	}

	return -1; // Target not found
}

export default binarySearch;
