import { readdir, stat, readFile, unlink } from "fs/promises";
import * as path from "path";

type FileInfo = {
	filename: string;
	modifiedTime: Date;
	filePath: string;
};

const MAX_FILES = 10;

async function loadLatestCsvFile(
	directoryPath: string
): Promise<string | null> {
	try {
		const files = await readdir(directoryPath);

		const csvFiles = files.filter(
			file => path.extname(file).toLowerCase() === ".csv"
		);

		if (csvFiles.length === 0) {
			console.log("No CSV files found in directory");
			return null;
		}

		const fileStats: FileInfo[] = await Promise.all(
			csvFiles.map(async (filename): Promise<FileInfo> => {
				const filePath = path.join(directoryPath, filename);
				const fileStats = await stat(filePath);
				return {
					filename,
					modifiedTime: fileStats.mtime,
					filePath,
				};
			})
		);

		fileStats.sort(
			(a, b) => b.modifiedTime.getTime() - a.modifiedTime.getTime()
		);

		if (fileStats.length > MAX_FILES) {
			const oldestFile = fileStats[fileStats.length - 1];
			try {
				await unlink(oldestFile.filePath);
				console.log(
					`Deleted oldest file: ${oldestFile.filename} (modified ${oldestFile.modifiedTime})`
				);
			} catch (deleteError) {
				console.error(
					`Failed to delete oldest file ${oldestFile.filename}:`,
					deleteError
				);
			}
		}

		const newestFile = fileStats[0];

		const filePath = path.join(directoryPath, newestFile.filename);
		const fileContent = await readFile(filePath, "utf-8");

		return fileContent;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error processing CSV files: ${error.message}`);
		}
		throw error;
	}
}

export { loadLatestCsvFile };
