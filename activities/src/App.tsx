import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Loading from "./components/Loading";
import Error from "./components/Error";
import MainContainer from "./components/MainContainer";

type AppProps = {
	startYear: number | null;
};

function App({ startYear }: AppProps) {
	return (
		<ErrorBoundary FallbackComponent={Error}>
			<Suspense fallback={<Loading />}>
				<MainContainer startYear={startYear} />
			</Suspense>
		</ErrorBoundary>
	);
}

export default App;
