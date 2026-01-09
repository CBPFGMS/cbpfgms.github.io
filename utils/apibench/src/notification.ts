import { writeFile, unlink } from "fs/promises";
import * as path from "path";
import { Datum } from "./schemas";

type ErrorDatum = Pick<Datum, "apiName" | "error" | "date">;

const errors: ErrorDatum[] = [];

export function collectError(error: Datum): void {
	const thisError: ErrorDatum = {
		apiName: error.apiName,
		error: error.error || "Unknown error",
		date: error.date,
	};
	errors.push(thisError);
}

export async function handleErrorNotification(
	directoryPath: string
): Promise<void> {
	const flagFilePath = path.join(directoryPath, "errors.json");

	if (errors.length > 0) {
		// Write error flag file with details
		try {
			await writeFile(
				flagFilePath,
				JSON.stringify({ errorCount: errors.length, errors }, null, 2),
				{ encoding: "utf-8" }
			);
			console.log(`Errors log file created at ${flagFilePath}`);
		} catch (error) {
			console.error("Failed to write errors log file:", error);
		}
	} else {
		// Delete error flag file if it exists (no errors today)
		try {
			await unlink(flagFilePath);
			console.log("No errors detected. Errors log file removed.");
		} catch (error) {
			// File doesn't exist, which is fine
			if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
				console.error("Failed to delete error flag file:", error);
			}
		}
	}
}
