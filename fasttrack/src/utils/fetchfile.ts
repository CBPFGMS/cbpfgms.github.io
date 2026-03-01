import { json, csv, csvParse, csvFormat, autoType } from "d3";
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
				? csvParse(JSON.parse(localData).data, autoType)
				: JSON.parse(localData).data;
		console.info(
			`%cInfo: data file ${fileName} retrieved from localStorage`,
			consoleStyle,
		);
		return fetchedData;
	} else {
		const fetchMethod =
			method === "csv" ? () => csv(url, autoType) : () => json(url);

		return fetchMethod()
			.then(fetchedData => {
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
				return fetchedData as T;
			})
			.catch((error: unknown) => {
				if (error instanceof Error) {
					console.error(
						`Error fetching the file ${fileName} from API. Error: ${error}.`,
					);
					throw error;
				} else {
					console.error(
						`Unknown error fetching the file ${fileName} from API.`,
					);
					throw new Error("Unknown error");
				}
			});
	}
}

export default fetchFile;
