import { json, csv, csvParse, csvFormat, autoType } from "d3";

const localStorageTime = 60 * 60 * 1000 * 48, //1 hour CHANGE!!!
	currentDate = new Date(),
	consoleStyle = "background-color: #0d6cb6; color: white; padding: 2px;";

function fetchFile<T>(
	fileName: string,
	url: string,
	method: string
): Promise<T> {
	const localData = localStorage.getItem(fileName);
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
			consoleStyle
		);
		return Promise.resolve(fetchedData);
	} else {
		const fetchMethod =
			method === "csv" ? () => csv(url, autoType) : () => json(url);
		return fetchMethod().then(fetchedData => {
			try {
				localStorage.setItem(
					fileName,
					JSON.stringify({
						data:
							method === "csv"
								? csvFormat(fetchedData as object[])
								: fetchedData,
						timeStamp: currentDate.getTime(),
					})
				);
			} catch (error) {
				console.warn(
					`Error saving the file ${fileName} in localStorage. Error: ${error}.`
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

export default fetchFile;
