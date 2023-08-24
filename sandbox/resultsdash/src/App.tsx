import React, { useState, useContext } from "react";
import useData from "./utils/api";
import Loading from "./components/Loading";
import Error from "./components/Error";

function App() {
	const { rawData, loading, error } = useData();

	const [reportYear, setReportYear] = useState<number | null>(null);
	const [year, setYear] = useState<number | null>(null);
	const [allocationType, setAllocationType] = useState<number | null>(null);

	return loading ? <Loading /> : error ? <Error /> : <div>Loaded</div>;
}

export default App;
