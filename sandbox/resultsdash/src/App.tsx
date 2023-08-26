// import React, { useState, useContext } from "react";
import useData from "./utils/api";
import Loading from "./components/Loading";
import Error from "./components/Error";
import DataContext from "./context/DataContext";
import Container from "./components/Container";
// import SelectionContext from "./context/selectioncontext";

function App() {
	const { rawData, lists, inDataLists, loading, error } = useData();

	// const [reportYear, setReportYear] = useState<number>();
	// const [year, setYear] = useState<number>();
	// const [allocationType, setAllocationType] = useState<number>();
	// const [fund, setFund] = useState<number>();
	// const [allocationSource, setAllocationSource] = useState<number>();

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
			<Container />
			{/* <SelectionContext.Provider
				value={{
					reportYear: reportYear,
					setReportYear: setReportYear,
					year: year,
					setYear: setYear,
					allocationType: allocationType,
					setAllocationType: setAllocationType,
					fund: fund,
					setFund: setFund,
					allocationSource: allocationSource,
					setAllocationSource: setAllocationSource,
				}}
			></SelectionContext.Provider> */}
		</DataContext.Provider>
	);
}

export default App;
