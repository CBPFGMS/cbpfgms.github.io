import { useEffect } from "react";
import type { DownloadStates } from "../components/MainContainer";
import type { InDataLists } from "../utils/processrawdata";
import type { DataStatuses } from "../utils/processdatastatuses";

type UpdateQueryStringParams = {
	queryStringValues: URLSearchParams;
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	setStatus: React.Dispatch<React.SetStateAction<number[]>>;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	inDataLists: InDataLists;
	fund: number[];
	status: number[];
	downloadStates: DownloadStates;
	dataStatuses: DataStatuses;
};

function useUpdateQueryString({
	fund,
	status,
	inDataLists,
	queryStringValues,
	setClickedDownload,
	setFund,
	setStatus,
	downloadStates,
	dataStatuses,
}: UpdateQueryStringParams): void {
	const statusArray = Object.keys(dataStatuses).map(d => +d);

	useEffect(() => {
		const fundParam = getNumericArrayParam("fund");
		const statusParam = getNumericArrayParam("status");

		if (fundParam) setFund(fundParam);
		if (statusParam) setStatus(statusParam);

		return () => {};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setClickedDownload(downloadStates);
		const fundParam =
			fund.length === inDataLists.funds.size ? "" : `fund=${fund}`;
		const statusParam =
			status.length === statusArray.length ? "" : `status=${status}`;

		if (fundParam || statusParam) {
			const params = buildQueryStringParams([fundParam, statusParam]);

			window.history.replaceState({}, "", `?${params}`);
		} else {
			window.history.replaceState({}, "", window.location.pathname);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fund, status]);

	function getNumericArrayParam(param: string): number[] | null {
		return queryStringValues.get(param)?.split(",").map(Number) ?? null;
	}

	function buildQueryStringParams(params: string[]): string {
		return params.filter(param => param).join("&");
	}
}

export default useUpdateQueryString;
