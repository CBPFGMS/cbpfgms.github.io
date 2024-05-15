import { openDB, DBSchema, IDBPDatabase } from "idb";
import { json, csv, autoType } from "d3";

const localStorageTime = 60 * 60 * 1000, //1 hour
	currentDate = new Date(),
	consoleStyle = "background-color: #0d6cb6; color: white; padding: 2px;";

interface LocalDatabase extends DBSchema {
	files: {
		key: string;
		value: { data: unknown; timeStamp: number };
	};
}

const dbPromise: Promise<IDBPDatabase<LocalDatabase>> = openDB<LocalDatabase>(
	"localDatabase",
	1,
	{
		upgrade(db) {
			db.createObjectStore("files");
		},
	}
);

async function fetchFileDB<T>(fileName: string, url: string, method: string) {
	const db = await dbPromise;
	const tx = db.transaction("files", "readwrite");
	const store = tx.objectStore("files");

	const localData = await store.get(fileName);
	if (
		localData &&
		localData.timeStamp > currentDate.getTime() - localStorageTime
	) {
		const fetchedData = localData.data as T;
		console.info(
			`%cInfo: data file ${fileName} retrieved from indexedDB`,
			consoleStyle
		);
		return Promise.resolve(fetchedData);
	} else {
		const fetchMethod =
			method === "csv" ? () => csv(url, autoType) : () => json(url);
		return fetchMethod().then(fetchedData => {
			try {
				const tx = db.transaction("files", "readwrite");
				const store = tx.objectStore("files");
				store.put(
					{
						data: fetchedData as T,
						timeStamp: currentDate.getTime(),
					},
					fileName
				);
			} catch (error) {
				console.warn(
					`Error saving the file ${fileName} in indexedDB. Error: ${error}.`
				);
			}
			console.info(
				`%cInfo: data file ${fileName} obtained from API call`,
				consoleStyle
			);
			return fetchedData as T;
		});
	}
}

export default fetchFileDB;
