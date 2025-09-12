import { csv, json, autoType } from "d3";
import { type Datum } from "./schemas";

type JsonFile = {
	latestFile: string;
};

const baseUrl =
		"https://raw.githubusercontent.com/CBPFGMS/cbpfgms.github.io/refs/heads/master/utils/apibench/data/",
	jsonUrl = baseUrl + "index.json";

export async function fetchFile(): Promise<Datum[]> {
	const fileName = await json<JsonFile>(jsonUrl).then(
		data => data?.latestFile
	);
	const dataUrl = baseUrl + fileName;
	const data = await csv<Datum>(dataUrl, autoType);
	return data;
}
