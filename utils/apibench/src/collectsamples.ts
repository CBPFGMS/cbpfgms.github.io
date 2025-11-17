import { apiList, type ApiList } from "./apilist.ts";
import { writeFile } from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import { csvParse, autoType } from "d3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Datum = {
	apiName: string;
	url: string;
	apiDatum: Record<string, any>;
};

const data: Datum[] = [];

const outputPath = path.resolve(__dirname, "..", "data", "samples.json");

const callAPIs = (endpoints: ApiList): Promise<Datum[]> => {
	return Promise.all(endpoints.map(extractFirstRow));
};

const extractFirstRow = async (datum: ApiList[number]): Promise<Datum> => {
	const url = datum.queryString
		? `${datum.url}${datum.queryString
				.replace("&$format=csv", "")
				.replace("?$format=csv", "?")}`
		: datum.url;

	if (url.includes(".csv")) {
		try {
			const response = await fetch(url);

			if (!response.ok) {
				return {
					apiName: datum.apiName,
					url: url,
					apiDatum: {
						error: `Request failed with status ${response.status}`,
					},
				};
			}

			const textData = await response.text();
			const jsonData = csvParse(textData, autoType);

			return {
				apiName: datum.apiName,
				url: url,
				apiDatum: jsonData[0] || {},
			};
		} catch (error) {
			return {
				apiName: datum.apiName,
				url: url,
				apiDatum: { error: (error as Error).message },
			};
		}
	} else {
		try {
			const response = await fetch(url);

			if (!response.ok) {
				return {
					apiName: datum.apiName,
					url: url,
					apiDatum: {
						error: `Request failed with status ${response.status}`,
					},
				};
			}

			const raw = (await response.json()) as unknown;

			let firstRow: Record<string, any> | undefined;

			if (Array.isArray(raw)) {
				firstRow = raw[0];
			} else if (
				raw &&
				typeof raw === "object" &&
				Array.isArray((raw as any).value)
			) {
				firstRow = (raw as any).value[0];
			}

			return {
				apiName: datum.apiName,
				url: url,
				apiDatum: firstRow || {},
			};
		} catch (error) {
			return {
				apiName: datum.apiName,
				url: url,
				apiDatum: { error: (error as Error).message },
			};
		}
	}
};

callAPIs(apiList)
	.then(samples => {
		samples.forEach(datum => data.push(datum));
	})
	.then(() => {
		try {
			writeFile(outputPath, JSON.stringify(data, null, 2), {
				encoding: "utf-8",
			});
			console.log(`Samples saved at ${outputPath}`);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Error saving samples file: ${error.message}`);
			}
			throw error;
		}
	});
