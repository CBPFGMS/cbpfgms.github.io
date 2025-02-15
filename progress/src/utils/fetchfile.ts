import { csvParse, csvFormat, autoType } from "d3";
import { fetchWithProgress } from "./fetchwithprogress";

const localStorageTime = 60 * 60 * 1000, //1 hour
	currentDate = new Date(),
	consoleStyle = "background-color: #0d6cb6; color: white; padding: 2px;";

async function fetchFile<T extends object[]>(
	fileName: string,
	url: string,
	method: string,
	setProgress: React.Dispatch<React.SetStateAction<number>>
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

			return fetchedData;
		} catch (error) {
			console.warn(
				`Error fetching the file ${fileName} from API. Error: ${error}.`
			);
			return Promise.reject(error);
		}
	}
}

export default fetchFile;
