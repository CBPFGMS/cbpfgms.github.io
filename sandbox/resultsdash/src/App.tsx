import React from "react";
import useData from "./utils/api";

function App() {
	const { rawData, loading, error } = useData();
	console.log(error)
	return <></>;
}

export default App;
