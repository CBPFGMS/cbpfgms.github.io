import useData from "./utils/api";
import Loading from "./components/Loading";
import Error from "./components/Error";
import DataContext from "./context/DataContext";
import MainContainer from "./components/MainContainer";

function App() {
	const { data, lists, inDataLists, loading, error } = useData();

	return loading ? (
		<Loading />
	) : error ? (
		<Error error={error} />
	) : (
		<DataContext.Provider value={{ data, lists, inDataLists }}>
			<MainContainer />
		</DataContext.Provider>
	);
}

export default App;
