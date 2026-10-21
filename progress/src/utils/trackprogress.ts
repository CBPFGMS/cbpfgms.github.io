async function trackProgress<T>(
	promise: Promise<T>,
	setProgress: React.Dispatch<React.SetStateAction<number>>,
): Promise<T> {
	const result = await promise;
	setProgress(progress => progress + 1);
	return result;
}

export default trackProgress;
