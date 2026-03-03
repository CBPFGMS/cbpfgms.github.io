import { useEffect } from "react";
import type { DownloadStates } from "../components/MainContainer";
import type { InDataLists } from "../utils/processrawdata";

type UpdateQueryStringParams = {
	queryStringValues: URLSearchParams;
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	inDataLists: InDataLists;
	fund: number[];
	downloadStates: DownloadStates;
};

function useUpdateQueryString({
	fund,
	inDataLists,
	queryStringValues,
	setClickedDownload,
	setFund,
	downloadStates,
}: UpdateQueryStringParams): void {
	useEffect(() => {
		const fundParam = getNumericArrayParam("fund");

		if (fundParam) setFund(fundParam);
		return () => {};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setClickedDownload(downloadStates);
		const fundParam =
			fund.length === inDataLists.funds.size ? "" : `fund=${fund}`;

		if (fundParam) {
			const params = buildQueryStringParams([fundParam]);

			window.history.replaceState({}, "", `?${params}`);
		} else {
			window.history.replaceState({}, "", window.location.pathname);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fund]);

	function getNumericArrayParam(param: string): number[] | null {
		return queryStringValues.get(param)?.split(",").map(Number) ?? null;
	}

	function buildQueryStringParams(params: string[]): string {
		return params.filter(param => param).join("&");
	}
}

export default useUpdateQueryString;
