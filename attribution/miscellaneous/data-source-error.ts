export type DataSourceErrorKind = "http" | "network" | "invalid-response";

class DataSourceError extends Error {
	readonly fileName: string;
	readonly url: string;
	readonly kind: DataSourceErrorKind;
	readonly status?: number;

	constructor(
		fileName: string,
		url: string,
		kind: DataSourceErrorKind,
		message: string,
		status?: number,
	) {
		super(message);
		this.name = "DataSourceError";
		this.fileName = fileName;
		this.url = url;
		this.kind = kind;
		this.status = status;
	}

	get host(): string {
		return new URL(this.url).hostname;
	}
}

export default DataSourceError;
