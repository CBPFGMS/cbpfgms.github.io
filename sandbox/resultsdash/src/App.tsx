import useData from "./utils/api";
import Loading from "./components/Loading";
import Error from "./components/Error";
import DataContext from "./context/DataContext";
import MainContainer from "./components/MainContainer";

function App() {
	const { rawData, lists, inDataLists, loading, error } = useData();

	return loading ? (
		<Loading />
	) : error ? (
		<Error />
	) : (
		<DataContext.Provider
			value={{
				rawData: rawData as RawData,
				lists: lists as List,
				inDataLists: inDataLists as InDataLists,
			}}
		>
			<MainContainer />
		</DataContext.Provider>
	);
}

export default App;
