import { writeFile } from "fs/promises";
import * as path from "path";

export async function saveFile(
	directoryPath: string,
	content: string,
	filename: string
): Promise<void> {
	try {
		const filePath = path.join(directoryPath, filename);

		await writeFile(filePath, content, { encoding: "utf-8" });

		console.log(`File saved at ${filePath}`);
	} catch (error) {
		console.error(`Error saving file ${filename}:`, error);
	}
}
