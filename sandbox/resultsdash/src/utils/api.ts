import { useState, useEffect } from "react";

//types

function useData() {
	const byClusterUrl = "",
		byDisabilityUrl = "",
		byLocationUrl = "",
		byTypeUrl = "",
		locationMasterUrl = "";

	const [data, setData] = useState(null),
		[loading, setLoading] = useState<boolean>(true),
		[error, setError] = useState<unknown>(null);
}

export default useData;
