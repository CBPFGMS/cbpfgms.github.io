import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { csv, json, autoType } from "d3";
import { constants } from "./constants";

const { localStorageTime, pageName, consoleStyle } = constants;

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
	},
);

async function fetchFileDB<T extends object[]>(
	fileName: string,
	url: string,
	method: string,
): Promise<T> {
	const combinedName = `${pageName}_${fileName}`;
	const currentDate = new Date();
	const db = await dbPromise;
	const tx = db.transaction("files", "readwrite");
	const store = tx.objectStore("files");

	const localData = await store.get(combinedName);
	if (
		localData &&
		localData.timeStamp > currentDate.getTime() - localStorageTime
	) {
		const fetchedData = localData.data as T;
		console.info(
			`%cInfo: data file ${fileName} retrieved from indexedDB`,
			consoleStyle,
		);
		return fetchedData;
	} else {
		const fetchMethod =
			method === "csv"
				? () =>
						csv<T[number]>(url, autoType).then(
							data => data as unknown as T,
						)
				: () => json<T>(url);

		return fetchMethod().then(fetchedData => {
			try {
				const tx = db.transaction("files", "readwrite");
				const store = tx.objectStore("files");
				store.put(
					{
						data: fetchedData as T,
						timeStamp: currentDate.getTime(),
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

			if (fetchedData === undefined || fetchedData === null) {
				throw new Error(`Failed to fetch data for ${fileName}`);
			}

			return fetchedData;
		});
	}
}

export default fetchFileDB;
