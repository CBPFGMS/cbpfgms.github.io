import useData from "./utils/api";
import Loading from "./components/Loading";
import Error from "./components/Error";
//import DataContext from "./context/DataContext";
//import MainContainer from "./components/MainContainer";
// import { RawData, List, InDataLists } from "./types";

type AppProps = {
	defaultYear: number;
};

function App({ defaultYear }: AppProps) {
	const { loading, error } = useData(); //remove this
	//const { rawData, lists, inDataLists, loading, error } = useData();

	return loading ? (
		<Loading />
	) : error ? (
		<Error error={error} />
	) : (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			API calls and data processing finished
		</div>
	);

	// return loading ? (
	// 	<Loading />
	// ) : error ? (
	// 	<Error error={error} />
	// ) : (
	// 	<DataContext.Provider
	// 		value={{
	// 			rawData: rawData as RawData,
	// 			lists: lists as List,
	// 			inDataLists: inDataLists as InDataLists,
	// 		}}
	// 	>
	// 		<MainContainer />
	// 	</DataContext.Provider>
	// );
}

export default App;
