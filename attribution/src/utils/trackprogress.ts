async function trackProgress<T>(
	promise: Promise<T>,
	onSettled: () => void,
): Promise<T> {
	const result = await promise;
	onSettled();
	return result;
}

export default trackProgress;
