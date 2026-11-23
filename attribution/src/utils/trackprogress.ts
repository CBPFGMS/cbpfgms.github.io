async function trackProgress<T>(
	promise: Promise<T>,
	onSettled: () => void,
): Promise<T> {
	try {
		return await promise;
	} finally {
		onSettled();
	}
}

export default trackProgress;
