import fetch from "node-fetch";
import { performance } from "perf_hooks";
import { ApiList } from "./apilist";
import { Datum } from "./schemas";

const DEFAULT_TIMEOUT = 30000; // 30 seconds

const date = new Date();

const errorObj = {
	dataReceived: false,
	responseTime: null,
	downloadTime: null,
	totalTime: null,
	contentSize: null,
	date: date,
};

const runBenchmark = async (endpoints: ApiList): Promise<Datum[]> => {
	return Promise.all(endpoints.map(benchmarkSingleEndpoint));
};

const benchmarkSingleEndpoint = async (
	datum: ApiList[number]
): Promise<Datum> => {
	const startTime = performance.now();
	const controller = new AbortController();
	const timeout = datum.maxTimeout || DEFAULT_TIMEOUT;
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	const url = datum.queryString
		? `${datum.url}${datum.queryString}`
		: datum.url;

	try {
		const response = await fetch(url, {
			signal: controller.signal,
		});

		const responseTime = performance.now() - startTime;

		if (!response.ok) {
			clearTimeout(timeoutId);
			return {
				id: datum.id,
				apiName: datum.apiName,
				...errorObj,
				error: `Request failed with status ${response.status}`,
			};
		}

		const buffer = await response.arrayBuffer();
		const downloadTime = performance.now() - startTime - responseTime;

		clearTimeout(timeoutId);

		return {
			id: datum.id,
			apiName: datum.apiName,
			dataReceived: true,
			responseTime,
			downloadTime,
			totalTime: responseTime + downloadTime,
			contentSize: buffer.byteLength,
			date,
			error: null,
		};
	} catch (error) {
		clearTimeout(timeoutId);

		return {
			id: datum.id,
			apiName: datum.apiName,
			...errorObj,
			error:
				error instanceof Error
					? error.name === "AbortError"
						? `Request timed out after ${timeout}ms`
						: error.message
					: "Unknown error occurred",
		};
	}
};

export { runBenchmark };
