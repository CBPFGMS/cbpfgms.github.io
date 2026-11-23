import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { csvParse, autoType } from "d3";
import { constants } from "./constants";
import DataSourceError, { type ProbeResult } from "./data-source-error";

const { localStorageTime, pageName, consoleStyle, buildVersion } = constants;

const REQUEST_TIMEOUT_MS = 30_000;
const PROBE_TIMEOUT_MS = 5_000;
const DB_OPEN_TIMEOUT_MS = 3_000;

type CacheEntry = {
	data: unknown;
	timeStamp: number;
	buildVersion: string;
};

interface LocalDatabase extends DBSchema {
	files: {
		key: string;
		value: CacheEntry;
	};
}

type CacheDb = IDBPDatabase<LocalDatabase>;

function withTimeout<T>(
	promise: Promise<T>,
	ms: number,
	fallback: T,
): Promise<T> {
	return new Promise(resolve => {
		const timer = setTimeout(() => resolve(fallback), ms);
		promise.then(
			value => {
				clearTimeout(timer);
				resolve(value);
			},
			() => {
				clearTimeout(timer);
				resolve(fallback);
			},
		);
	});
}

function openCache(): Promise<CacheDb | null> {
	try {
		const opening = openDB<LocalDatabase>("localDatabase", 1, {
			upgrade(db) {
				if (!db.objectStoreNames.contains("files")) {
					db.createObjectStore("files");
				}
			},
		}).catch(error => {
			console.warn(
				"IndexedDB is unavailable; data will not be cached.",
				error,
			);
			return null;
		});
		return withTimeout(opening, DB_OPEN_TIMEOUT_MS, null);
	} catch (error) {
		console.warn(
			"IndexedDB is unavailable; data will not be cached.",
			error,
		);
		return Promise.resolve(null);
	}
}

const dbPromise = openCache();

function createTimeout(ms: number) {
	const controller = new AbortController();
	let expired = false;
	const timer = setTimeout(() => {
		expired = true;
		controller.abort();
	}, ms);

	return {
		signal: controller.signal,
		get expired() {
			return expired;
		},
		clear: () => clearTimeout(timer),
		abort: () => controller.abort(),
	};
}

async function probeRequest(url: string): Promise<ProbeResult> {
	const timer = createTimeout(PROBE_TIMEOUT_MS);
	try {
		await fetch(url, {
			mode: "no-cors",
			cache: "no-store",
			credentials: "omit",
			signal: timer.signal,
		});
		timer.abort();
		return "opaque-response";
	} catch {
		return timer.expired ? "probe-timed-out" : "probe-failed";
	} finally {
		timer.clear();
	}
}

const probesInFlight = new Map<string, Promise<ProbeResult>>();

function getProbeResult(url: string): Promise<ProbeResult> {
	let origin: string;
	try {
		origin = new URL(url, window.location.href).origin;
	} catch {
		return Promise.resolve("probe-failed");
	}

	let probe = probesInFlight.get(origin);
	if (!probe) {
		probe = probeRequest(url).finally(() => probesInFlight.delete(origin));
		probesInFlight.set(origin, probe);
	}
	return probe;
}

function timeoutError(
	fileName: string,
	url: string,
	timeoutMs: number,
	cause?: unknown,
): DataSourceError {
	return new DataSourceError(
		fileName,
		url,
		"timeout",
		`The request did not complete within ${Math.round(timeoutMs / 1000)} seconds.`,
		undefined,
		cause,
	);
}

function parseResponse<T>(
	fileName: string,
	url: string,
	method: "csv" | "json",
	text: string,
): T {
	if (!text.trim()) {
		throw new DataSourceError(
			fileName,
			url,
			"invalid-response",
			"The server returned an empty response.",
		);
	}
	if (/^\s*<(?:!doctype|html|head|body)\b/i.test(text)) {
		throw new DataSourceError(
			fileName,
			url,
			"invalid-response",
			`The server returned an HTML page instead of ${method.toUpperCase()} data.`,
		);
	}

	try {
		return (
			method === "csv" ? csvParse(text, autoType) : JSON.parse(text)
		) as T;
	} catch (cause) {
		throw new DataSourceError(
			fileName,
			url,
			"invalid-response",
			`The server returned an unusable ${method.toUpperCase()} response.`,
			undefined,
			cause,
		);
	}
}

async function download<T>(
	fileName: string,
	url: string,
	method: "csv" | "json",
): Promise<T> {
	const timer = createTimeout(REQUEST_TIMEOUT_MS);
	try {
		let response: Response;
		try {
			response = await fetch(url, { signal: timer.signal });
		} catch (cause) {
			if (timer.expired) {
				throw timeoutError(fileName, url, REQUEST_TIMEOUT_MS, cause);
			}

			throw new DataSourceError(
				fileName,
				url,
				"request-failed",
				"The browser did not provide a readable response to the request.",
				undefined,
				cause,
				await getProbeResult(url),
			);
		}

		if (!response.ok) {
			void response.body?.cancel().catch(() => undefined);
			throw new DataSourceError(
				fileName,
				url,
				"http",
				`The server returned HTTP ${response.status}.`,
				response.status,
			);
		}

		let text: string;
		try {
			text = await response.text();
		} catch (cause) {
			if (timer.expired) {
				throw timeoutError(fileName, url, REQUEST_TIMEOUT_MS, cause);
			}
			throw new DataSourceError(
				fileName,
				url,
				"interrupted",
				"The response started but the connection ended before its body was fully read.",
				undefined,
				cause,
			);
		}

		return parseResponse<T>(fileName, url, method, text);
	} finally {
		timer.clear();
	}
}

async function readCache(
	db: CacheDb | null,
	key: string,
): Promise<CacheEntry | undefined> {
	if (!db) return undefined;
	try {
		return await db.get("files", key);
	} catch (error) {
		console.warn(`Could not read ${key} from IndexedDB.`, error);
		return undefined;
	}
}

async function writeCache(
	db: CacheDb | null,
	key: string,
	entry: CacheEntry,
): Promise<void> {
	if (!db) return;
	try {
		await db.put("files", entry, key);
	} catch (error) {
		console.warn(`Could not save ${key} in IndexedDB.`, error);
	}
}

async function fetchFileDB<T>(
	fileName: string,
	url: string,
	method: "csv" | "json",
): Promise<T> {
	const cacheKey = `${pageName}::${url}`;
	const db = await dbPromise;
	const cached = await readCache(db, cacheKey);

	if (
		cached &&
		cached.buildVersion === buildVersion &&
		cached.timeStamp > Date.now() - localStorageTime
	) {
		console.info(
			`%cInfo: data file ${fileName} retrieved from IndexedDB`,
			consoleStyle,
		);
		return cached.data as T;
	}

	const keyPrefix = `${pageName}_${fileName}_`;
	if (db) {
		try {
			const keys = await db.getAllKeys("files");
			await Promise.all(
				keys
					.filter(key => key.startsWith(keyPrefix))
					.map(key => db.delete("files", key)),
			);
		} catch (error) {
			console.warn(
				`Could not clean up old cache entries for ${fileName}.`,
				error,
			);
		}
	}

	const data = await download<T>(fileName, url, method);
	await writeCache(db, cacheKey, {
		data,
		timeStamp: Date.now(),
		buildVersion,
	});

	console.info(
		`%cInfo: data file ${fileName} obtained from API call`,
		consoleStyle,
	);
	return data;
}

export default fetchFileDB;
