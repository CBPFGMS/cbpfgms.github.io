export type DataSourceErrorKind =
	| "http" // the server answered with an error status
	| "timeout" // no (complete) response arrived within the time limit
	| "unreachable" // no answer at network level: offline, DNS, refused/reset, TLS, firewall, blocked...
	| "unreadable" // something answered, but the browser would not let this page read it: CORS, proxy page, redirect...
	| "interrupted" // the connection dropped while the body was downloading
	| "invalid-response"; // a readable response whose content is unusable: HTML page, empty, malformed, failed validation

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
		cause?: unknown,
	) {
		super(message);
		// Keeps `instanceof DataSourceError` working even if the build target is ES5.
		Object.setPrototypeOf(this, new.target.prototype);
		this.name = "DataSourceError";
		this.fileName = fileName;
		this.url = url;
		this.kind = kind;
		this.status = status;
		if (cause !== undefined) {
			Object.defineProperty(this, "cause", {
				value: cause,
				configurable: true,
				writable: true,
			});
		}
	}

	// Never throws: this getter runs while the error screen renders, and a throw there blanks the whole page.
	get host(): string {
		try {
			return new URL(this.url, window.location.href).hostname;
		} catch {
			return "unknown";
		}
	}
}

export default DataSourceError;
