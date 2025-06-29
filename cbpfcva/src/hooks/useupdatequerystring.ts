import { useEffect } from "react";
import { type DownloadStates } from "../components/MainContainer";
import { type InDataLists } from "../utils/processrawdata";

type UpdateQueryStringParams = {
	queryStringValues: URLSearchParams;
	setYear: React.Dispatch<React.SetStateAction<number[]>>;
	setOrganizationType: React.Dispatch<React.SetStateAction<number[]>>;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	inDataLists: InDataLists;
	year: number[];
	fund: number[];
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	organizationType: number[];
	downloadStates: DownloadStates;
	defaultYear: number;
};

function useUpdateQueryString({
	year,
	organizationType,
	inDataLists,
	queryStringValues,
	fund,
	setFund,
	setYear,
	setOrganizationType,
	setClickedDownload,
	downloadStates,
	defaultYear,
}: UpdateQueryStringParams): void {
	useEffect(() => {
		const yearParam = getNumericArrayParam("year");
		const organizationTypeParam = getNumericArrayParam("organizationType");
		const fundParam = getNumericArrayParam("fund");

		if (yearParam) setYear(yearParam);
		if (organizationTypeParam) setOrganizationType(organizationTypeParam);
		if (fundParam) setFund(fundParam);

		return () => {};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setClickedDownload(downloadStates);
		const yearParam =
			year.length === 1 && year[0] === defaultYear ? "" : `year=${year}`;
		const organizationTypeParam =
			organizationType.length === inDataLists.organizationTypes.size
				? ""
				: `organizationType=${organizationType}`;
		const fundParam =
			fund.length === inDataLists.funds.size ? "" : `fund=${fund}`;

		if (yearParam || organizationTypeParam || fundParam) {
			const params = buildQueryStringParams([
				yearParam,
				organizationTypeParam,
				fundParam,
			]);

			window.history.replaceState({}, "", `?${params}`);
		} else {
			window.history.replaceState({}, "", window.location.pathname);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [year, organizationType, fund]);

	function getNumericArrayParam(param: string): number[] | null {
		return queryStringValues.get(param)?.split(",").map(Number) ?? null;
	}

	function buildQueryStringParams(params: string[]): string {
		return params.filter(param => param).join("&");
	}
}

export default useUpdateQueryString;
