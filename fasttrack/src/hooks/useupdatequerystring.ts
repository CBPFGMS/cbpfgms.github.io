import { useEffect } from "react";
import type { DownloadStates, Statuses } from "../components/MainContainer";
import type { InDataLists } from "../utils/processrawdata";
import { constants } from "../utils/constants";

const { projectStatus } = constants;

const statusArray = projectStatus.map(status => status.value);

type UpdateQueryStringParams = {
	queryStringValues: URLSearchParams;
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	setStatus: React.Dispatch<React.SetStateAction<Statuses[]>>;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	inDataLists: InDataLists;
	fund: number[];
	status: Statuses[];
	downloadStates: DownloadStates;
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
}: UpdateQueryStringParams): void {
	useEffect(() => {
		const fundParam = getNumericArrayParam("fund");
		const statusParam = getNumericArrayParam("status");

		if (fundParam) setFund(fundParam);
		if (statusParam) setStatus(statusParam as Statuses[]);

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
