import useData from "./utils/api";
import { useState } from "react";
import Loading from "./components/Loading";
import Error from "./components/Error";
import DataContext from "./context/datacontext";
import MainContainer from "./components/MainContainer";
import DashboardSelector from "./components/DashboardSelector";

function App() {
	const { rawData, lists, inDataLists, loading, error } = useData();

	const [dashboard, setDashboard] = useState<Dashboard>("results");

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
			<DashboardSelector
				dashboard={dashboard}
				setDashboard={setDashboard}
			/>
			<MainContainer />
		</DataContext.Provider>
	);
}

export default App;
