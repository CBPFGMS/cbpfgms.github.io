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

export default warnInvalidSchema;
