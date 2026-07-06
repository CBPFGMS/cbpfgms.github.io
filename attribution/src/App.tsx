import { Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Loading from "./components/Loading";
import Error from "./components/Error";
import PageController from "./components/PageController";
import { fetchAppData } from "./utils/api";
import DataContext from "./context/DataContext";

type AppProps = {
	startYear: number | null;
	defaultFundType: number | null;
};

const queryStringDonor = new URLSearchParams(window.location.search).get(
	"donor",
);
const selectedDonor = queryStringDonor ? parseInt(queryStringDonor) : null;

function App({ startYear, defaultFundType }: AppProps) {
	const dataPromise = useMemo(
		() => fetchAppData(startYear, defaultFundType),
		[startYear, defaultFundType],
	);

	return (
		<ErrorBoundary FallbackComponent={Error}>
			<Suspense fallback={<Loading />}>
				<DataContext.Provider value={dataPromise}>
					<PageController selectedDonor={selectedDonor} />
				</DataContext.Provider>
			</Suspense>
		</ErrorBoundary>
	);
}

export default App;
