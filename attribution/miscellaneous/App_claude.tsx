import { Suspense, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Loading from "./components/Loading";
import ErrorFallback from "./components/ErrorFallback";
import PageController from "./components/PageController";
import { fetchAppData, type AppData } from "./utils/api";
import DataContext from "./context/DataContext";
import InvalidDonor from "./components/InvalidDonor";

type AppProps = {
	startYear: number | null;
};

// Digits only: parseInt would accept "12abc" as 12 and "abc" as NaN (and NaN would be sent to the API).
const queryStringDonor = new URLSearchParams(window.location.search).get(
	"donor",
);
const selectedDonor =
	queryStringDonor !== null && /^\d+$/.test(queryStringDonor)
		? Number(queryStringDonor)
		: null;

// One request set per (startYear, donor, attempt), created outside React's render cycle.
// useMemo is not a safe place for side effects: StrictMode runs it twice in development,
// which doubled every request. A new `attempt` after "Try again" creates a genuinely new promise;
// without it the error boundary would re-throw the same, already rejected, promise.
const dataCache = new Map<string, Promise<AppData>>();

function getAppData(
	startYear: number | null,
	donor: number,
	attempt: number,
): Promise<AppData> {
	const key = `${startYear ?? "current"}:${donor}:${attempt}`;
	let promise = dataCache.get(key);
	if (!promise) {
		promise = fetchAppData(startYear, donor);
		dataCache.set(key, promise);
	}
	return promise;
}

function App({ startYear }: AppProps) {
	const [attempt, setAttempt] = useState(0);

	const dataPromise = useMemo(
		() =>
			selectedDonor === null
				? null
				: getAppData(startYear, selectedDonor, attempt),
		[startYear, attempt],
	);

	if (selectedDonor === null || dataPromise === null) {
		return <InvalidDonor />;
	}

	return (
		<ErrorBoundary
			FallbackComponent={ErrorFallback}
			onError={error => console.error("Dashboard error:", error)}
			onReset={() => setAttempt(current => current + 1)}
		>
			<Suspense fallback={<Loading />}>
				<DataContext.Provider value={dataPromise}>
					<PageController selectedDonor={selectedDonor} />
				</DataContext.Provider>
			</Suspense>
		</ErrorBoundary>
	);
}

export default App;
