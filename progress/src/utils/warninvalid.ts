const isProdSite = window.location.hostname === "cbpf.data.unocha.org";

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
	row: Record<string, unknown>
) {
	if (!isProdSite) {
		console.warn(
			`Project code not found in the reached data: ${projectCode}\nRow with project not found: ${JSON.stringify(
				row
			)}`
		);
	}
}

export { warnProjectNotFound };

export default warnInvalidSchema;
