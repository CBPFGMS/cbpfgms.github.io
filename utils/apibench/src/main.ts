import { runBenchmark } from "./measurecalls";
import { apiList } from "./apilist";
import { loadLatestCsvFile } from "./readfile";
import { csvParse, autoType, csvFormat } from "d3";
import { Datum, dataSchema } from "./schemas";
import { saveCsvFile } from "./writefile";
import * as path from "path";
import { fileURLToPath } from "url";
import { collectError, handleErrorNotification } from "./notification";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIRECTORY_PATH = path.resolve(__dirname, "..", "data");

const latestCsvText = await loadLatestCsvFile(DIRECTORY_PATH);

const data =
	latestCsvText === null
		? ([] as Datum[])
		: csvParse<Datum, keyof Datum>(latestCsvText, autoType);

const parsedData = dataSchema.safeParse(data);

const results = await runBenchmark(apiList);

results.forEach(result => {
	if (!result.dataReceived) {
		console.error(`Error: No data received for ${result.apiName}`);
		collectError(result);
	}
});

if (parsedData.success) {
	parsedData.data.push(...results);
	saveCsvFile(DIRECTORY_PATH, csvFormat(parsedData.data), "benchmark");
} else {
	console.log(`Error parsing data: ${parsedData.error}`);
	saveCsvFile(DIRECTORY_PATH, csvFormat(results), "benchmark");
}

await handleErrorNotification(DIRECTORY_PATH);
