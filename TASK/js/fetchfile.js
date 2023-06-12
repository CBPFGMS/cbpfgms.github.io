import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const localStorageTime = 10 * 60 * 1000, //1 hour
	currentDate = new Date(),
	consoleStyle = "background-color: #0d6cb6; color: white; padding: 2px;";

function fetchFile(fileName, url, method) {
	if (
		localStorage.getItem(fileName) &&
		JSON.parse(localStorage.getItem(fileName)).timestamp >
			currentDate.getTime() - localStorageTime
	) {
		const fetchedData =
			method === "csv"
				? d3.csvParse(
						JSON.parse(localStorage.getItem(fileName)).data,
						d3.autoType
				  )
				: JSON.parse(localStorage.getItem(fileName)).data;
		console.info(
			`%cInfo: data file ${fileName} retrieved from local storage`,
			consoleStyle
		);
		return Promise.resolve(fetchedData);
	} else {
		const fetchMethod = method === "csv" ? d3.csv : d3.json;
		const rowFunction = method === "csv" ? d3.autoType : null;
		return fetchMethod(url, rowFunction).then(fetchedData => {
			try {
				localStorage.setItem(
					fileName,
					JSON.stringify({
						data:
							method === "csv"
								? d3.csvFormat(fetchedData)
								: fetchedData,
						timestamp: currentDate.getTime(),
					})
				);
			} catch (error) {
				console.warn(
					`Error saving the file ${fileName} in the local storage. Error: ${error}.`
				);
			}
			console.info(
				`%cInfo: data file ${fileName} obtained from API call`,
				consoleStyle
			);
			return fetchedData;
		});
	}
}

export { fetchFile };
