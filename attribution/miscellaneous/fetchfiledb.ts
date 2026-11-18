import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { csvParse, autoType } from "d3";
import { constants } from "./constants";
import DataSourceError from "./data-source-error";

const { localStorageTime, pageName, consoleStyle, buildVersion } = constants;

interface LocalDatabase extends DBSchema {
	files: {
		key: string;
		value: { data: unknown; timeStamp: number; buildVersion: string };
	};
}

// Single persistent database instance
const dbPromise: Promise<IDBPDatabase<LocalDatabase>> = openDB<LocalDatabase>(
	"localDatabase",
	1,
	{
		upgrade(db) {
			if (!db.objectStoreNames.contains("files")) {
				db.createObjectStore("files");
			}
		},
	},
);

async function fetchFileDB<T>(
	fileName: string,
	url: string,
	method: "csv" | "json",
): Promise<T> {
	const combinedName = `${pageName}_${fileName}_${buildVersion}`;
	const keyPrefix = `${pageName}_${fileName}`;
	const currentDate = new Date();
	const db = await dbPromise;

	// 1. Clean up outdated keys for THIS file from previous builds
	const allKeys = await db.getAllKeys("files");
	for (const key of allKeys) {
		if (key.startsWith(keyPrefix) && key !== combinedName) {
			await db.delete("files", key);
		}
	}

	// 2. Check cache for current key
	const localData = await db.get("files", combinedName);
	if (
		localData &&
		localData.timeStamp > currentDate.getTime() - localStorageTime
	) {
		console.info(
			`%cInfo: data file ${fileName} retrieved from indexedDB`,
			consoleStyle,
		);
		return localData.data as T;
	}

	// 3. Cache miss / expired / old version -> Fetch fresh data
	let response: Response;
	try {
		response = await fetch(url);
	} catch {
		throw new DataSourceError(
			fileName,
			url,
			"network",
			"Request failed. This may be caused by connectivity, CORS, or network policy.",
		);
	}

	if (!response.ok) {
		throw new DataSourceError(
			fileName,
			url,
			"http",
			`The server returned HTTP ${response.status}.`,
			response.status,
		);
	}

	let fetchedData: T;
	try {
		if (method === "csv") {
			const text = await response.text();
			if (/^\s*<(?:!doctype|html|head|body)\b/i.test(text)) {
				throw new DataSourceError(
					fileName,
					url,
					"invalid-response",
					"The server returned an HTML page instead of CSV data.",
				);
			}
			fetchedData = csvParse(text, autoType) as unknown as T;
		} else {
			fetchedData = await response.json();
		}
	} catch (error) {
		if (error instanceof DataSourceError) throw error;
		throw new DataSourceError(
			fileName,
			url,
			"invalid-response",
			`The server returned an unusable ${method.toUpperCase()} response.`,
		);
	}

	try {
		// 4. Save to IndexedDB (create a fresh transaction right when writing)
		try {
			await db.put(
				"files",
				{
					data: fetchedData,
					timeStamp: currentDate.getTime(),
					buildVersion,
				},
				combinedName,
			);
		} catch (error) {
			console.warn(
				`Error saving the file ${fileName} in indexedDB. Error: ${error}.`,
			);
		}

		console.info(
			`%cInfo: data file ${fileName} obtained from API call`,
			consoleStyle,
		);
		return fetchedData;
	} catch (error) {
		console.warn(
			`Error saving or processing the file ${fileName}. Error: ${error}.`,
		);
		throw error;
	}
}

export default fetchFileDB;
