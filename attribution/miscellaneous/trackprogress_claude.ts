async function trackProgress<T>(
	promise: Promise<T>,
	onSettled: () => void,
): Promise<T> {
	try {
		return await promise;
	} finally {
		onSettled(); // on success AND on failure, so the counter reflects settled requests
	}
}

export default trackProgress;
