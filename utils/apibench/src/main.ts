import { runBenchmark } from "./measurecalls";
import { apiList } from "./apilist";
import { loadLatestCsvFile } from "./readfile";
import { csvParse, autoType, csvFormat } from "d3";
import { Datum, dataSchema } from "./schemas";
import { saveCsvFile } from "./writefile";
import * as path from "path";
import { fileURLToPath } from "url";

const _dirname = path.dirname(fileURLToPath(import.meta.url));

const DIRECTORY_PATH = path.join(_dirname, "../data");

const latestCsvText = await loadLatestCsvFile(DIRECTORY_PATH);

const data =
	latestCsvText === null
		? ([] as Datum[])
		: csvParse<Datum, keyof Datum>(latestCsvText, autoType);

const parsedData = dataSchema.safeParse(data);

const results = await runBenchmark(apiList);

if (parsedData.success) {
	parsedData.data.push(...results);
	saveCsvFile(DIRECTORY_PATH, csvFormat(parsedData.data), "benchmark");
} else {
	console.log(`Error parsing data: ${parsedData.error}`);
	saveCsvFile(DIRECTORY_PATH, csvFormat(results), "benchmark");
}
