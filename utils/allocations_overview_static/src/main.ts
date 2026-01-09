import { fetchData } from "./fetchdata.js";
import { saveFile } from "./savedata.js";
import { apiFiles } from "./apislist.js";
import * as path from "path";
import { fileURLToPath } from "url";

export type ErrorResponse = {
	errorMessage: string;
	url: string;
	date: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIRECTORY_PATH = path.resolve(__dirname, "..", "data");

const errorArray: ErrorResponse[] = [];

const firstYear = 2015,
	lastYear = new Date().getFullYear(),
	yearsArray: number[] = [];

const csvFormatParameter = "&$format=csv",
	yearParameter = "AllocationYear=";

for (let year = firstYear; year <= lastYear; year++) {
	yearsArray.push(year);
}

const yearlyApis = apiFiles.filter(api => api.type === "yearly");
const completeApis = apiFiles.filter(api => api.type === "complete");

for (const api of yearlyApis) {
	for (const year of yearsArray) {
		const url = `${api.url}${yearParameter}${year}${csvFormatParameter}`;
		const data = await fetchData(url, errorArray);
		if (data) {
			const fileName = `${api.name}_${year}.csv`;
			await saveFile(DIRECTORY_PATH, data, fileName);
		}
	}
}

for (const api of completeApis) {
	const data = await fetchData(api.url, errorArray);
	if (data) {
		const fileName = `${api.name}.csv`;
		await saveFile(DIRECTORY_PATH, data, fileName);
	}
}

if (errorArray.length > 0) {
	const errorLogContent = JSON.stringify(errorArray, null, 2);
	const errorLogFileName = `error_log_${new Date()
		.toISOString()
		.replace(/[:.]/g, "-")}.json`;
	await saveFile(DIRECTORY_PATH, errorLogContent, errorLogFileName);
}

await saveFile(DIRECTORY_PATH, new Date().toISOString(), "last_updated.txt");