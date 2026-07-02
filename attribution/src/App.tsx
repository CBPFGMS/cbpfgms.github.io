import { Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Loading from "./components/Loading";
import Error from "./components/Error";
import PageController from "./components/PageController";
import { fetchAppData } from "./utils/api";
import DataContext from "./context/DataContext";

function App() {
	const dataPromise = useMemo(() => fetchAppData(), []);

	return (
		<ErrorBoundary FallbackComponent={Error}>
			<Suspense fallback={<Loading />}>
				<DataContext.Provider value={dataPromise}>
					<PageController />
				</DataContext.Provider>
			</Suspense>
		</ErrorBoundary>
	);
}

export default App;
