import { Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Loading from "./components/Loading";
import Error from "./components/Error";
import { fetchAppData } from "./utils/api";
import DataContext from "./context/DataContext";
import MainContainer from "./components/MainContainer";

type AppProps = {
	startYear: number | null;
};

function App({ startYear }: AppProps) {
	const dataPromise = useMemo(() => fetchAppData(startYear), [startYear]);

	return (
		<ErrorBoundary FallbackComponent={Error}>
			<Suspense fallback={<Loading />}>
				<DataContext.Provider value={dataPromise}>
					<MainContainer />
				</DataContext.Provider>
			</Suspense>
		</ErrorBoundary>
	);
}

export default App;
