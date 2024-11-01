import { exec } from "child_process";
import { Datum } from "./schemas";

export function notifyError(error: Datum): void {
	const notificationTitle = "API Cron Job Error";
	const notificationMessage =
		`An error ocurred in ${error.apiName} at ${error.date}` ||
		"An error occurred";

	const script = `osascript -e 'tell app "System Events" to display dialog "${notificationMessage}" with title "${notificationTitle}" buttons {"OK"} default button "OK"'`;

	exec(script);
}
