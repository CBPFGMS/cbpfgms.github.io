import { ErrorResponse } from "./main.ts";

export async function fetchData(
	url: string,
	errorArray: ErrorResponse[]
): Promise<string | null> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			const errorMsg = `HTTP error! status: ${response.status}`;
			errorArray.push({
				errorMessage: errorMsg,
				url,
				date: new Date().toISOString(),
			});
			return null;
		}

		return await response.text();
	} catch (error) {
		if (error instanceof Error) {
			errorArray.push({
				errorMessage: error.message,
				url,
				date: new Date().toISOString(),
			});
		} else {
			errorArray.push({
				errorMessage: String(error),
				url,
				date: new Date().toISOString(),
			});
		}
		return null;
	}
}
