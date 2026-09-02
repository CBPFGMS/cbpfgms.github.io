import { useEffect } from "react";
import {
	DownloadStates,
	ImplementationStatuses,
	Tranche,
} from "../components/MainContainer";
import { InDataLists } from "../utils/processrawdata";
import constants from "../utils/constants";

type UpdateQueryStringParams = {
	queryStringValues: URLSearchParams;
	setAllocationType: React.Dispatch<React.SetStateAction<number[]>>;
	setAllocationSource: React.Dispatch<React.SetStateAction<number[]>>;
	setFund: React.Dispatch<React.SetStateAction<number[]>>;
	setYear: React.Dispatch<React.SetStateAction<number[]>>;
	setImplementationStatus: React.Dispatch<
		React.SetStateAction<ImplementationStatuses[]>
	>;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	setTranche: React.Dispatch<React.SetStateAction<Tranche>>;
	inDataLists: InDataLists;
	year: number[];
	fund: number[];
	allocationType: number[];
	allocationSource: number[];
	implementationStatus: ImplementationStatuses[];
	tranche: Tranche;
	downloadStates: DownloadStates;
	defaultYear: number;
};

const { implementationStatuses } = constants;

function useUpdateQueryString({
	allocationSource,
	allocationType,
	fund,
	implementationStatus,
	inDataLists,
	queryStringValues,
	setAllocationSource,
	setAllocationType,
	setClickedDownload,
	setFund,
	setImplementationStatus,
	setYear,
	setTranche,
	year,
	tranche,
	downloadStates,
	defaultYear,
}: UpdateQueryStringParams): void {
	const implementationStatusesFiltered = implementationStatuses;

	useEffect(() => {
		const allocationTypesParam = getNumericArrayParam("allocationType");
		const allocationSourcesParam = getNumericArrayParam("allocationSource");
		const fundParam = getNumericArrayParam("fund");
		const yearParam = getNumericArrayParam("year");
		const implementationStatusParam = getStringArrayParam(
			"implementationStatus",
		);
		const trancheParam = queryStringValues.get("tranche");

		if (allocationTypesParam) setAllocationType(allocationTypesParam);
		if (allocationSourcesParam) setAllocationSource(allocationSourcesParam);
		if (fundParam) setFund(fundParam);
		if (yearParam) setYear(yearParam);
		if (implementationStatusParam) {
			setImplementationStatus(implementationStatusParam);
		}
		if (trancheParam) setTranche(+trancheParam as Tranche);
		return () => {};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setClickedDownload(downloadStates);
		const allocationTypesParam =
			allocationType.length === inDataLists.allocationTypes.size
				? ""
				: `allocationType=${allocationType}`;
		const allocationSourcesParam =
			allocationSource.length === inDataLists.allocationSources.size
				? ""
				: `allocationSource=${allocationSource}`;
		const fundParam =
			fund.length === inDataLists.funds.size ? "" : `fund=${fund}`;
		const yearParam =
			year.length === 1 && year[0] === defaultYear ? "" : `year=${year}`;
		const implementationStatusParam =
			implementationStatus.length ===
			implementationStatusesFiltered.length
				? ""
				: `implementationStatus=${implementationStatus}`;
		const trancheParam = tranche === "all" ? "" : `tranche=${tranche}`;

		if (
			allocationTypesParam ||
			allocationSourcesParam ||
			fundParam ||
			yearParam ||
			implementationStatusParam ||
			trancheParam
		) {
			const params = buildQueryStringParams([
				allocationTypesParam,
				allocationSourcesParam,
				fundParam,
				yearParam,
				implementationStatusParam,
				trancheParam,
			]);

			window.history.replaceState({}, "", `?${params}`);
		} else {
			window.history.replaceState({}, "", window.location.pathname);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [implementationStatus, year, fund, allocationSource, allocationType]);

	function getNumericArrayParam(param: string): number[] | null {
		return queryStringValues.get(param)?.split(",").map(Number) ?? null;
	}

	function getStringArrayParam(
		param: string,
	): ImplementationStatuses[] | null {
		return (
			(queryStringValues
				.get(param)
				?.split(",") as ImplementationStatuses[]) ?? null
		);
	}

	function buildQueryStringParams(params: string[]): string {
		return params.filter(param => param).join("&");
	}
}

export default useUpdateQueryString;
