import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { csvParse, autoType } from "d3";
import { constants } from "./constants";
import DataSourceError from "./data-source-error";

const { localStorageTime, pageName, consoleStyle, buildVersion } = constants;

const REQUEST_TIMEOUT_MS = 30_000;
const PROBE_TIMEOUT_MS = 5_000;
const DB_OPEN_TIMEOUT_MS = 3_000;

// The database ("localDatabase") may be shared with other dashboards on the same origin,
// so every key is namespaced with this page's name.
const CACHE_KEY_PREFIX = `${pageName}::`;
// Keys written by earlier versions of this module (`${pageName}_${fileName}_${buildVersion}`).
const LEGACY_KEY_PREFIX = `${pageName}_`;

type CacheEntry = { data: unknown; timeStamp: number; buildVersion: string };

interface LocalDatabase extends DBSchema {
	files: {
		key: string;
		value: CacheEntry;
	};
}

type CacheDb = IDBPDatabase<LocalDatabase>;

export type FetchFileOptions<T> = {
	/** Give up on a request after this many milliseconds. Default: 30 000. */
	timeoutMs?: number;
	/** Return a message if the parsed data is not what the dashboard expects, or null if it is. */
	validate?: (data: T) => string | null;
};

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

// The cache is an optimisation, never a requirement: if IndexedDB is unavailable
// (blocked site data, private mode, policy, a hanging open...) data is simply not cached.
function openCache(): Promise<CacheDb | null> {
	try {
		const opening = openDB<LocalDatabase>("localDatabase", 1, {
			upgrade(db) {
				if (!db.objectStoreNames.contains("files")) {
					db.createObjectStore("files");
				}
			},
		}).catch(error => {
			console.warn("IndexedDB is not available; data will not be cached.", error);
			return null;
		});
		return withTimeout(opening, DB_OPEN_TIMEOUT_MS, null);
	} catch (error) {
		console.warn("IndexedDB is not available; data will not be cached.", error);
		return Promise.resolve(null);
	}
}

// One-time, best-effort removal of entries written by the previous key format (this page only).
async function purgeLegacyEntries(db: CacheDb): Promise<void> {
	try {
		const keys = await db.getAllKeys("files");
		await Promise.all(
			keys
				.filter(key => key.startsWith(LEGACY_KEY_PREFIX))
				.map(key => db.delete("files", key)),
		);
	} catch {
		// ignore: purely housekeeping
	}
}

const dbPromise = openCache();
void dbPromise.then(db => (db ? purgeLegacyEntries(db) : undefined));

async function readCache(
	db: CacheDb | null,
	key: string,
): Promise<CacheEntry | undefined> {
	if (!db) return undefined;
	try {
		return await db.get("files", key);
	} catch (error) {
		console.warn(`Could not read ${key} from indexedDB. Error: ${error}.`);
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
		console.warn(`Error saving ${key} in indexedDB. Error: ${error}.`);
	}
}

function createTimeout(ms: number) {
	const controller = new AbortController();
	let expired = false;
	const timer = setTimeout(() => {
		expired = true;
		controller.abort();
	}, ms);
	return {
		signal: controller.signal,
		get timedOut() {
			return expired;
		},
		clear: () => clearTimeout(timer),
		abort: () => controller.abort(),
	};
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
		`No complete response within ${Math.round(timeoutMs / 1000)} seconds. The connection may be slow, the service overloaded, or the traffic blocked by a firewall or VPN.`,
		undefined,
		cause,
	);
}

// When a request fails at network level the browser gives no reason (CORS, DNS, firewall, TLS... all look
// identical to JavaScript). The one extra signal available: retry in "no-cors" mode. That resolves if
// *anything* answered, even though the page is not allowed to read the answer.
async function runProbe(url: string): Promise<boolean> {
	const timer = createTimeout(PROBE_TIMEOUT_MS);
	try {
		await fetch(url, { mode: "no-cors", signal: timer.signal });
		return true;
	} catch {
		return false;
	} finally {
		timer.clear();
		timer.abort(); // stop downloading the (unreadable) body
	}
}

const probesInFlight = new Map<string, Promise<boolean>>();

// Concurrent failures against the same origin share one probe.
function isHostAnswering(url: string): Promise<boolean> {
	let origin: string;
	try {
		origin = new URL(url, window.location.href).origin;
	} catch {
		return Promise.resolve(false);
	}
	let probe = probesInFlight.get(origin);
	if (!probe) {
		probe = runProbe(url).finally(() => probesInFlight.delete(origin));
		probesInFlight.set(origin, probe);
	}
	return probe;
}

async function describeRequestFailure(
	fileName: string,
	url: string,
	cause: unknown,
	timedOut: boolean,
	timeoutMs: number,
): Promise<DataSourceError> {
	if (timedOut) return timeoutError(fileName, url, timeoutMs, cause);

	if (await isHostAnswering(url)) {
		return new DataSourceError(
			fileName,
			url,
			"unreadable",
			"Something answered, but the browser did not allow this page to read the response. Typical causes: a proxy or firewall returning its own page, a redirect to a login or block page, or a server configuration (CORS) problem.",
			undefined,
			cause,
		);
	}

	const offline =
		typeof navigator !== "undefined" && navigator.onLine === false;
	return new DataSourceError(
		fileName,
		url,
		"unreachable",
		offline
			? "The browser reports that this device is offline."
			: "No answer from the server. This may be caused by connectivity, DNS or firewall restrictions, a VPN or proxy, or a browser extension.",
		undefined,
		cause,
	);
}

const HTML_START = /^\s*<(?:!doctype|html|head|body)\b/i;

function parseBody<T>(
	fileName: string,
	url: string,
	method: "csv" | "json",
	text: string,
): T {
	const label = method.toUpperCase();
	if (text.trim() === "") {
		throw new DataSourceError(
			fileName,
			url,
			"invalid-response",
			"The server returned an empty response.",
		);
	}
	if (HTML_START.test(text)) {
		throw new DataSourceError(
			fileName,
			url,
			"invalid-response",
			`The server returned an HTML page instead of ${label} data.`,
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
			`The server returned an unusable ${label} response.`,
			undefined,
			cause,
		);
	}
}

async function download<T>(
	fileName: string,
	url: string,
	method: "csv" | "json",
	timeoutMs: number,
): Promise<T> {
	const timer = createTimeout(timeoutMs);
	try {
		let response: Response;
		try {
			response = await fetch(url, { signal: timer.signal });
		} catch (cause) {
			throw await describeRequestFailure(
				fileName,
				url,
				cause,
				timer.timedOut,
				timeoutMs,
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
			throw timer.timedOut
				? timeoutError(fileName, url, timeoutMs, cause)
				: new DataSourceError(
					  fileName,
					  url,
					  "interrupted",
					  "The connection was interrupted while the data was downloading.",
					  undefined,
					  cause,
				  );
		}

		return parseBody<T>(fileName, url, method, text);
	} finally {
		timer.clear();
	}
}

async function fetchFileDB<T>(
	fileName: string,
	url: string,
	method: "csv" | "json",
	options: FetchFileOptions<T> = {},
): Promise<T> {
	const { timeoutMs = REQUEST_TIMEOUT_MS, validate } = options;
	const cacheKey = `${CACHE_KEY_PREFIX}${url}`;
	const db = await dbPromise;

	// 1. Cache: valid only for this build, within the TTL, and (if a validator is given) still valid.
	const cached = await readCache(db, cacheKey);
	if (
		cached &&
		cached.buildVersion === buildVersion &&
		cached.timeStamp > Date.now() - localStorageTime &&
		!validate?.(cached.data as T)
	) {
		console.info(
			`%cInfo: data file ${fileName} retrieved from indexedDB`,
			consoleStyle,
		);
		return cached.data as T;
	}

	// 2. Cache miss / expired / old build -> download
	const data = await download<T>(fileName, url, method, timeoutMs);

	const problem = validate?.(data);
	if (problem) {
		throw new DataSourceError(fileName, url, "invalid-response", problem);
	}

	// 3. Save. An empty result is returned but not cached, so a bad response cannot stick for the whole TTL.
	if (!(Array.isArray(data) && data.length === 0)) {
		await writeCache(db, cacheKey, {
			data,
			timeStamp: Date.now(),
			buildVersion,
		});
	}

	console.info(
		`%cInfo: data file ${fileName} obtained from API call`,
		consoleStyle,
	);
	return data;
}

export default fetchFileDB;
