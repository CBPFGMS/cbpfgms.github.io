const isProdSite = window.location.hostname === "cbpf.data.unocha.org";

function warnInvalidSchema(file: string, row: Record<string, unknown>) {
	if (!isProdSite) {
		console.warn(
			`File: ${file}\nrow with incorrect value types: ${JSON.stringify(
				row
			)}`
		);
	}
}

export default warnInvalidSchema;
