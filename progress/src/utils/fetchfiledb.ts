import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { csvParse, autoType } from "d3";
import constants from "./constants";

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
	method: string,
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
	try {
		const response = await fetch(url);
		let fetchedData: T;

		if (method === "csv") {
			const text = await response.text();
			fetchedData = csvParse(text, autoType) as unknown as T;
		} else {
			fetchedData = await response.json();
		}

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
			`Error fetching the file ${fileName} from API. Error: ${error}.`,
		);
		throw error;
	}
}

export default fetchFileDB;
