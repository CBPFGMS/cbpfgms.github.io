import { useEffect } from "react";
import { type DownloadStates } from "../components/MainContainer";
import { type InDataLists } from "../utils/processrawdata";

type UpdateQueryStringParams = {
	queryStringValues: URLSearchParams;
	setYearSummary: React.Dispatch<React.SetStateAction<number[]>>;
	setCountrySummary: React.Dispatch<React.SetStateAction<number[]>>;
	setAllocationSourceSummary: React.Dispatch<React.SetStateAction<number[]>>;
	setYearCountries: React.Dispatch<React.SetStateAction<number[]>>;
	setSectorCountries: React.Dispatch<React.SetStateAction<number[]>>;
	setPartnerCountries: React.Dispatch<React.SetStateAction<number[]>>;
	setClickedDownload: React.Dispatch<React.SetStateAction<DownloadStates>>;
	inDataLists: InDataLists;
	yearSummary: number[];
	countrySummary: number[];
	allocationSourceSummary: number[];
	yearCountries: number[];
	sectorCountries: number[];
	partnerCountries: number[];
	downloadStates: DownloadStates;
	defaultYear: number;
};

function useUpdateQueryString({
	yearSummary,
	countrySummary,
	allocationSourceSummary,
	yearCountries,
	sectorCountries,
	partnerCountries,
	inDataLists,
	queryStringValues,
	setYearSummary,
	setCountrySummary,
	setAllocationSourceSummary,
	setYearCountries,
	setSectorCountries,
	setPartnerCountries,
	setClickedDownload,
	downloadStates,
	defaultYear,
}: UpdateQueryStringParams): void {
	useEffect(() => {
		const yearSummaryParam = getNumericArrayParam("yearSummary");
		const countrySummaryParam = getNumericArrayParam("countrySummary");
		const allocationSourceSummaryParam = getNumericArrayParam(
			"allocationSourceSummary"
		);
		const yearCountriesParam = getNumericArrayParam("yearCountries");
		const sectorCountriesParam = getNumericArrayParam("sectorCountries");
		const partnerCountriesParam = getNumericArrayParam("partnerCountries");

		if (yearSummaryParam) setYearSummary(yearSummaryParam);
		if (countrySummaryParam) setCountrySummary(countrySummaryParam);
		if (allocationSourceSummaryParam)
			setAllocationSourceSummary(allocationSourceSummaryParam);
		if (yearCountriesParam) setYearCountries(yearCountriesParam);
		if (sectorCountriesParam) setSectorCountries(sectorCountriesParam);
		if (partnerCountriesParam) setPartnerCountries(partnerCountriesParam);

		return () => {};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setClickedDownload(downloadStates);
		const yearSummaryParam =
			yearSummary.length === 1 && yearSummary[0] === defaultYear
				? ""
				: `yearSummary=${yearSummary}`;
		const countrySummaryParam =
			countrySummary.length === inDataLists.countries.size
				? ""
				: `countrySummary=${countrySummary}`;
		const allocationSourceSummaryParam =
			allocationSourceSummary.length ===
			inDataLists.allocationSources.size
				? ""
				: `allocationSourceSummary=${allocationSourceSummary}`;
		const yearCountriesParam =
			yearCountries.length === 1 && yearCountries[0] === defaultYear
				? ""
				: `yearCountries=${yearCountries}`;
		const sectorCountriesParam =
			sectorCountries.length === inDataLists.sectors.size
				? ""
				: `sectorCountries=${sectorCountries}`;
		const partnerCountriesParam =
			partnerCountries.length === inDataLists.organizations.size
				? ""
				: `partnerCountries=${partnerCountries}`;

		if (
			yearSummaryParam ||
			countrySummaryParam ||
			allocationSourceSummaryParam ||
			yearCountriesParam ||
			sectorCountriesParam ||
			partnerCountriesParam
		) {
			const params = buildQueryStringParams([
				yearSummaryParam,
				countrySummaryParam,
				allocationSourceSummaryParam,
				yearCountriesParam,
				sectorCountriesParam,
				partnerCountriesParam,
			]);

			window.history.replaceState({}, "", `?${params}`);
		} else {
			window.history.replaceState({}, "", window.location.pathname);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		yearSummary,
		countrySummary,
		allocationSourceSummary,
		yearCountries,
		sectorCountries,
		partnerCountries,
	]);

	function getNumericArrayParam(param: string): number[] | null {
		return queryStringValues.get(param)?.split(",").map(Number) ?? null;
	}

	function buildQueryStringParams(params: string[]): string {
		return params.filter(param => param).join("&");
	}
}

export default useUpdateQueryString;
