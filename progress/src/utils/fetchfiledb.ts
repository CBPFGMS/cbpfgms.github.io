import { openDB, DBSchema, IDBPDatabase } from "idb";
import { csvParse, autoType } from "d3";
import { fetchWithProgress } from "./fetchwithprogress";

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

async function fetchFileDB<T>(
	fileName: string,
	url: string,
	method: string,
	setProgress: React.Dispatch<React.SetStateAction<number>>
): Promise<T> {
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
		return fetchedData;
	} else {
		try {
			const response = await fetchWithProgress(url, setProgress);

			let fetchedData: T;

			if (method === "csv") {
				const text = await response.text();
				fetchedData = csvParse(text, autoType) as unknown as T;
			} else {
				fetchedData = await response.json();
			}

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
		} catch (error) {
			console.warn(
				`Error fetching the file ${fileName} from API. Error: ${error}.`
			);
			return Promise.reject(error);
		}
	}
}

export default fetchFileDB;
