import { Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Loading from "./components/Loading";
import Error from "./components/Error";
import MainContainer from "./components/MainContainer";
import { fetchAppData } from "./utils/api";

type AppProps = {
	startYear: number | null;
};

function App({ startYear }: AppProps) {
	const dataPromise = useMemo(() => fetchAppData(startYear), [startYear]);

	return (
		<ErrorBoundary FallbackComponent={Error}>
			<Suspense fallback={<Loading />}>
				<MainContainer dataPromise={dataPromise} />
			</Suspense>
		</ErrorBoundary>
	);
}

export default App;
