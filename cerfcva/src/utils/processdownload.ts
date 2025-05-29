import { type Data } from "./processrawdata";
import { type List } from "./makelists";

type BaseDownloadDatum = {
	Year: number;
	Country: string;
	"Allocation Source": string;
	"Allocation Name": string;
	"Project Code": string;
	Budget: number;
};

type CvaTypeDatumDownload = BaseDownloadDatum & {
	"CVA type": string;
};

type SectorsDatumDownload = BaseDownloadDatum & {
	Sector: string;
};

type AgenciesDatumDownload = BaseDownloadDatum & {
	Partner: string;
};

type CountryDatumDownload = BaseDownloadDatum & {
	latitude: number;
	longitude: number;
};

type ProcessDownloadParams = {
	data: Data;
	lists: List;
	yearSummary: number[];
	countrySummary: number[];
	allocationSourceSummary: number[];
};

type ProcessDownloadCountryParams = {
	data: Data;
	lists: List;
	yearCountries: number[];
	sectorCountries: number[];
	partnerCountries: number[];
};

export function processCvaTypeDownload({
	data,
	lists,
	yearSummary,
	countrySummary,
	allocationSourceSummary,
}: ProcessDownloadParams): CvaTypeDatumDownload[] {
	const cvaDataDownload: CvaTypeDatumDownload[] = [];

	data.forEach(datum => {
		if (datum.cvaData !== null) {
			if (
				checkRowSummary(
					datum,
					yearSummary,
					countrySummary,
					allocationSourceSummary
				)
			) {
				const baseDownloadDatum = populateBaseDownloadDatum(
					datum,
					lists
				);

				datum.cvaData.forEach(cva => {
					cvaDataDownload.push({
						...baseDownloadDatum,
						"CVA type": lists.cvaTypeNames[cva.cvaId],
					});
				});
			}
		}
	});

	return cvaDataDownload;
}

export function processSectorsDownload({
	data,
	lists,
	yearSummary,
	countrySummary,
	allocationSourceSummary,
}: ProcessDownloadParams): SectorsDatumDownload[] {
	const sectorsDataDownload: SectorsDatumDownload[] = [];

	data.forEach(datum => {
		if (datum.cvaData !== null) {
			if (
				checkRowSummary(
					datum,
					yearSummary,
					countrySummary,
					allocationSourceSummary
				)
			) {
				const baseDownloadDatum = populateBaseDownloadDatum(
					datum,
					lists
				);

				datum.cvaData.forEach(cva => {
					sectorsDataDownload.push({
						...baseDownloadDatum,
						Sector: lists.sectors[cva.sectorId],
					});
				});
			}
		}
	});

	return sectorsDataDownload;
}

export function processAgenciesDownload({
	data,
	lists,
	yearSummary,
	countrySummary,
	allocationSourceSummary,
}: ProcessDownloadParams): AgenciesDatumDownload[] {
	const agenciesDataDownload: AgenciesDatumDownload[] = [];

	data.forEach(datum => {
		if (datum.cvaData !== null) {
			if (
				checkRowSummary(
					datum,
					yearSummary,
					countrySummary,
					allocationSourceSummary
				)
			) {
				const baseDownloadDatum = populateBaseDownloadDatum(
					datum,
					lists
				);

				datum.cvaData.forEach(() => {
					agenciesDataDownload.push({
						...baseDownloadDatum,
						Partner:
							lists.organizations[
								lists.organizationsCompleteList[
									datum.organizationGlobalId
								].GlobalOrgId
							],
					});
				});
			}
		}
	});

	return agenciesDataDownload;
}

export function processCountryDownload({
	data,
	lists,
	yearCountries,
	partnerCountries,
	sectorCountries,
}: ProcessDownloadCountryParams): CountryDatumDownload[] {
	const countriesDataDownload: CountryDatumDownload[] = [];

	data.forEach(datum => {
		if (datum.cvaData !== null) {
			if (
				checkRowSummaryCountry(
					datum,
					yearCountries,
					sectorCountries,
					partnerCountries
				)
			) {
				const baseDownloadDatum = populateBaseDownloadDatum(
					datum,
					lists
				);

				datum.cvaData.forEach(() => {
					countriesDataDownload.push({
						...baseDownloadDatum,
						latitude: lists.fundCoordinates[datum.fund].latitude,
						longitude: lists.fundCoordinates[datum.fund].longitude,
					});
				});
			}
		}
	});

	return countriesDataDownload;
}

function populateBaseDownloadDatum(
	datum: Data[number],
	lists: List
): BaseDownloadDatum {
	return {
		Year: datum.year,
		Country: lists.fundNames[datum.fund],
		"Allocation Source": lists.allocationSources[datum.allocationSource],
		"Allocation Name": lists.allocationTypes[datum.allocationType],
		"Project Code": datum.projectCode,
		Budget: datum.budget,
	};
}

function checkRowSummary(
	datum: Data[number],
	yearSummary: number[],
	countrySummary: number[],
	allocationSourceSummary: number[]
): boolean {
	return (
		yearSummary.includes(datum.year) &&
		countrySummary.includes(datum.fund) &&
		allocationSourceSummary.includes(datum.allocationSource)
	);
}

function checkRowSummaryCountry(
	datum: Data[number],
	yearCountries: number[],
	sectorCountries: number[],
	partnerCountries: number[]
): boolean {
	const sectorIncluded = !!datum.cvaData?.some(cva =>
		sectorCountries.includes(cva.sectorId)
	);

	return (
		yearCountries.includes(datum.year) &&
		sectorIncluded &&
		partnerCountries.includes(datum.organizationId)
	);
}
