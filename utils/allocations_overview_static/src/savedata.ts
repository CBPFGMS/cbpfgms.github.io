import { writeFile } from "fs/promises";
import * as path from "path";

export function saveFile(
	directoryPath: string,
	content: string,
	filename: string
): void {
	try {
		const filePath = path.join(directoryPath, filename);

		writeFile(filePath, content, { encoding: "utf-8" });

		console.log(`File saved at ${filePath}`);
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error saving CSV file: ${error.message}`);
		}
		throw error;
	}
}
