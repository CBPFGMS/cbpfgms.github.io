import { writeFile } from "fs/promises";
import * as path from "path";

async function saveCsvFile(
	directoryPath: string,
	content: string,
	filename: string
): Promise<void> {
	try {
		const baseFilename = path
			.parse(filename)
			.name.replace(/[^\w\s-]/g, "") // Remove invalid characters
			.replace(/\s+/g, "-"); // Replace spaces with hyphens

		const timestamp = new Date()
			.toISOString()
			.replace(/[:.]/g, "-") // Replace : and . with -
			.replace(/[Z]/g, ""); // Remove Z

		const fullFilename = `${baseFilename}_${timestamp}.csv`;

		const filePath = path.join(directoryPath, fullFilename);

		await writeFile(filePath, content, { encoding: "utf-8" });

		await updateIndex(directoryPath, fullFilename);

		console.log(`File saved at ${filePath}`);
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error saving CSV file: ${error.message}`);
		}
		throw error;
	}
}

async function updateIndex(directoryPath: string, latestFilename: string) {
	const indexPath = path.join(directoryPath, "index.json");
	const indexContent = JSON.stringify({ latestFile: latestFilename });
	await writeFile(indexPath, indexContent);
}

export { saveCsvFile };
