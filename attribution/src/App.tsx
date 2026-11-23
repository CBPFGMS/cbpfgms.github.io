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

const queryStringDonor = new URLSearchParams(window.location.search).get(
	"donor",
);
const selectedDonor = queryStringDonor ? parseInt(queryStringDonor) : null;

let latestAppDataRequest: {
	key: string;
	promise: Promise<AppData>;
} | null = null;

function getAppDataRequest(
	startYear: number | null,
	selectedDonor: number,
	attempt: number,
): Promise<AppData> {
	const key = `${startYear ?? "current"}:${selectedDonor}:${attempt}`;
	if (latestAppDataRequest?.key !== key) {
		latestAppDataRequest = {
			key,
			promise: fetchAppData(startYear, selectedDonor),
		};
	}
	return latestAppDataRequest.promise;
}

function App({ startYear }: AppProps) {
	const [attempt, setAttempt] = useState(0);
	const dataPromise = useMemo(() => {
		if (selectedDonor === null) return null;
		return getAppDataRequest(startYear, selectedDonor, attempt);
	}, [startYear, attempt]);

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
