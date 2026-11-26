import { Suspense, useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Loading from "./components/Loading";
import ErrorFallback from "./components/ErrorFallback";
import PageController from "./components/PageController";
import { fetchAppData, type AppData } from "./utils/api";
import DataContext from "./context/DataContext";
import InvalidFund from "./components/InvalidFund";

type AppProps = {
	startYear: number | null;
};

const queryStringFund = new URLSearchParams(window.location.search).get("fund");
const selectedFund = queryStringFund ? parseInt(queryStringFund) : null;

let latestAppDataRequest: {
	key: string;
	promise: Promise<AppData>;
} | null = null;

function getAppDataRequest(
	startYear: number | null,
	selectedFund: number,
	attempt: number,
): Promise<AppData> {
	const key = `${startYear ?? "current"}:${selectedFund}:${attempt}`;
	if (latestAppDataRequest?.key !== key) {
		latestAppDataRequest = {
			key,
			promise: fetchAppData(startYear, selectedFund),
		};
	}
	return latestAppDataRequest.promise;
}

function App({ startYear }: AppProps) {
	const [attempt, setAttempt] = useState(0);
	const dataPromise = useMemo(() => {
		if (selectedFund === null) return null;
		return getAppDataRequest(startYear, selectedFund, attempt);
	}, [startYear, attempt]);

	if (selectedFund === null || dataPromise === null) {
		return <InvalidFund />;
	}

	return (
		<ErrorBoundary
			FallbackComponent={ErrorFallback}
			onError={error => console.error("Dashboard error:", error)}
			onReset={() => setAttempt(current => current + 1)}
		>
			<Suspense fallback={<Loading />}>
				<DataContext.Provider value={dataPromise}>
					<PageController selectedFund={selectedFund} />
				</DataContext.Provider>
			</Suspense>
		</ErrorBoundary>
	);
}

export default App;
