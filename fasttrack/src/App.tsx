import useData from "./utils/api";
import Loading from "./components/Loading";
import Error from "./components/Error";
import DataContext from "./context/DataContext";
import MainContainer from "./components/MainContainer";
type AppProps = {
	defaultFundType: number | null;
	startYear: number | null;
};

function App({ defaultFundType, startYear }: AppProps) {
	const {
		data,
		dataIndicators,
		lists,
		inDataLists,
		loading,
		error,
		progress,
	} = useData(defaultFundType, startYear);

	return loading ? (
		<Loading progress={progress} />
	) : error ? (
		<Error error={error} />
	) : (
		<DataContext.Provider
			value={{ data, dataIndicators, lists, inDataLists }}
		>
			<MainContainer />
		</DataContext.Provider>
	);
}

export default App;
