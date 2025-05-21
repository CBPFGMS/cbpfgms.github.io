import { warnFetchError } from "./warninvalid";

async function fetchWithProgress(
	url: string,
	setProgress: React.Dispatch<React.SetStateAction<number>>
): Promise<Response> {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	let loaded = 0;

	const reader = response.body?.getReader();
	if (!reader) {
		warnFetchError(url, "Response body is null");
		throw new Error("Response body is null");
	}

	const stream = new ReadableStream({
		async start(controller) {
			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					controller.close();
					break;
				}

				loaded += value.length;
				setProgress(progress => progress + loaded);

				controller.enqueue(value);
			}
		},
	});

	return new Response(stream, {
		headers: response.headers,
		status: response.status,
		statusText: response.statusText,
	});
}

export { fetchWithProgress };
