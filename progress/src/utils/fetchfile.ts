import { csvParse, csvFormat, autoType } from "d3";
import constants from "./constants";

const { localStorageTime, pageName, consoleStyle, buildVersion } = constants;

const currentDate = new Date();

async function fetchFile<T>(
	fileName: string,
	url: string,
	method: "csv" | "json",
): Promise<T> {
	const combinedName = `${pageName}_${fileName}_${buildVersion}`;
	const localData = localStorage.getItem(combinedName);

	//removing outdated localStorage data based on build version
	const localStorageKeys = Object.keys(localStorage);
	for (const key of localStorageKeys) {
		if (
			key.startsWith(`${pageName}_${fileName}`) &&
			!key.includes(buildVersion)
		) {
			localStorage.removeItem(key);
		}
	}

	if (
		localData &&
		JSON.parse(localData).timeStamp >
			currentDate.getTime() - localStorageTime
	) {
		const fetchedData: T =
			method === "csv"
				? csvParse(JSON.parse(localData).data, autoType)
				: JSON.parse(localData).data;
		console.info(
			`%cInfo: data file ${fileName} retrieved from localStorage`,
			consoleStyle,
		);
		return fetchedData;
	} else {
		try {
			const response = await fetch(url);

			let fetchedData: T;

			if (method === "csv") {
				const text = await response.text();
				fetchedData = csvParse(text, autoType) as unknown as T;
			} else {
				fetchedData = await response.json();
			}

			try {
				localStorage.setItem(
					combinedName,
					JSON.stringify({
						data:
							method === "csv"
								? csvFormat(fetchedData as object[])
								: fetchedData,
						timeStamp: currentDate.getTime(),
					}),
				);
			} catch (error) {
				console.warn(
					`Error saving the file ${fileName} in localStorage. Error: ${error}.`,
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
			return Promise.reject(error);
		}
	}
}

export default fetchFile;
