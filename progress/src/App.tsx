import useData from "./utils/api";
import Loading from "./components/Loading";
import Error from "./components/Error";
import DataContext from "./context/DataContext";
import MainContainer from "./components/MainContainer";

type AppProps = {
	defaultYear: number;
	defaultFundType: number | null;
};

function App({ defaultYear, defaultFundType }: AppProps) {
	const { data, lists, inDataLists, loading, error } =
		useData(defaultFundType);

	return loading ? (
		<Loading />
	) : error ? (
		<Error error={error} />
	) : (
		<DataContext.Provider value={{ data, lists, inDataLists }}>
			<MainContainer defaultYear={defaultYear} />
		</DataContext.Provider>
	);
}

export default App;