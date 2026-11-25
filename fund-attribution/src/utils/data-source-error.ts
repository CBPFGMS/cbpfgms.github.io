export type ProbeResult =
	| "opaque-response"
	| "probe-failed"
	| "probe-timed-out";

export type DataSourceErrorKind =
	| "http"
	| "timeout"
	| "request-failed"
	| "interrupted"
	| "invalid-response";

class DataSourceError extends Error {
	readonly fileName: string;
	readonly url: string;
	readonly kind: DataSourceErrorKind;
	readonly status?: number;
	readonly probeResult?: ProbeResult;

	constructor(
		fileName: string,
		url: string,
		kind: DataSourceErrorKind,
		message: string,
		status?: number,
		cause?: unknown,
		probeResult?: ProbeResult,
	) {
		super(message, { cause });
		this.name = "DataSourceError";
		this.fileName = fileName;
		this.url = url;
		this.kind = kind;
		this.status = status;
		this.probeResult = probeResult;
	}

	get host(): string {
		try {
			return new URL(this.url, window.location.href).hostname;
		} catch {
			return "unknown";
		}
	}
}

export default DataSourceError;
