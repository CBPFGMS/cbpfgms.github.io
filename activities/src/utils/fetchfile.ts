import { csv, json, csvParse, csvFormat, autoType } from "d3";
import { constants } from "./constants";

const { localStorageTime, pageName, consoleStyle } = constants;

const currentDate = new Date();

async function fetchFile<T extends object[]>(
	fileName: string,
	url: string,
	method: "csv" | "json",
): Promise<T> {
	const combinedName = `${pageName}_${fileName}`;
	const localData = localStorage.getItem(combinedName);
	if (
		localData &&
		JSON.parse(localData).timeStamp >
			currentDate.getTime() - localStorageTime
	) {
		const fetchedData: T =
			method === "csv"
				? (csvParse(
						JSON.parse(localData).data,
						autoType,
					) as unknown as T)
				: (JSON.parse(localData).data as T);
		console.info(
			`%cInfo: data file ${fileName} retrieved from localStorage`,
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

			if (fetchedData === undefined || fetchedData === null) {
				throw new Error(`Failed to fetch data for ${fileName}`);
			}

			return fetchedData;
		});
	}
}

export default fetchFile;
