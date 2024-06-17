//import { constants } from "./constants";

//const { isProdSite } = constants;
const isProdSite = false; //CHANGE

function warnInvalidSchema(
	file: string,
	row: Record<string, unknown>,
	error: string
) {
	if (!isProdSite) {
		console.warn(
			`File: ${file}\n-----\nRow with incorrect value types: ${JSON.stringify(
				row
			)}\n-----\nError description: ${error}`
		);
	}
}

function warnProjectNotFound(
	projectCode: string,
	row: Record<string, unknown>,
	message: string
) {
	if (!isProdSite) {
		console.warn(
			`${message}: ${projectCode}\nRow with project not found: ${JSON.stringify(
				row
			)}`
		);
	}
}

export { warnProjectNotFound };

export default warnInvalidSchema;
