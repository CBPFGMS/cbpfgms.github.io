import { useEffect } from "react";
import type { DownloadStates, Tranche } from "../components/MainContainer";
import type { InDataLists } from "../utils/processrawdata";
import type { DataStatuses } from "../utils/processdatastatuses";

type UpdateQueryStringParams = {
	queryStringValues: URLSearchParams;
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	setStatus: React.Dispatch<React.SetStateAction<number[]>>;
	setTranche: React.Dispatch<React.SetStateAction<Tranche>>;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	inDataLists: InDataLists;
	fund: number[];
	status: number[];
	tranche: Tranche;
	downloadStates: DownloadStates;
	dataStatuses: DataStatuses;
};

function useUpdateQueryString({
	fund,
	status,
	tranche,
	inDataLists,
	queryStringValues,
	setClickedDownload,
	setFund,
	setStatus,
	setTranche,
	downloadStates,
	dataStatuses,
}: UpdateQueryStringParams): void {
	const statusArray = Object.keys(dataStatuses).map(d => +d);

	useEffect(() => {
		const fundParam = getNumericArrayParam("fund");
		const statusParam = getNumericArrayParam("status");
		const trancheParam = queryStringValues.get("tranche");

		if (fundParam) setFund(fundParam);
		if (statusParam) setStatus(statusParam);
		if (trancheParam) setTranche(+trancheParam as Tranche);

		return () => {};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setClickedDownload(downloadStates);
		const fundParam =
			fund.length === inDataLists.funds.size ? "" : `fund=${fund}`;
		const statusParam =
			status.length === statusArray.length ? "" : `status=${status}`;
		const trancheParam = tranche === "all" ? "" : `tranche=${tranche}`;

		if (fundParam || statusParam || trancheParam) {
			const params = buildQueryStringParams([
				fundParam,
				statusParam,
				trancheParam,
			]);

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
