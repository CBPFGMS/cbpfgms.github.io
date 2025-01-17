import { useEffect, useState } from "react";
import { RawDatum } from "./schemas";
import fetchFile from "./fetchfile";

type Datum = RawDatum;

function useData(): { originalData: Datum[] } {
	const [data, setData] = useState<Datum[]>([]),
		[loading, setLoading] = useState<boolean>(true),
		[error, setError] = useState<string | null>(null);

	useEffect(() => {}, []);

	return { originalData: [] };
}

export { useData };
