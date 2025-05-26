import { type Data } from "./processrawdata";
import { type List } from "./makelists";
import { type AllocationWindows } from "./processdatasummary";

type ProcessDataCountriesParams = {
	data: Data;
	yearCountries: number[];
	sectorCountries: number[];
	partnerCountries: number[];
	lists: List;
};

export type DatumCountries = {
	country: number;
	allocations: number;
	rr: number;
	ufe: number;
	latitude: number;
	longitude: number;
};

export type InSelectionDataCountries = {
	partnersCountries: Set<number>;
	sectorsCountries: Set<number>;
	yearsCountries: Set<number>;
};

function processDataCountries({
	data,
	yearCountries,
	sectorCountries,
	partnerCountries,
	lists,
}: ProcessDataCountriesParams): {
	dataCountries: DatumCountries[];
	inSelectionDataCountries: InSelectionDataCountries;
} {
	const inSelectionDataCountries: InSelectionDataCountries = {
		partnersCountries: new Set(),
		sectorsCountries: new Set(),
		yearsCountries: new Set(),
	};

	const dataCountries: DatumCountries[] = [];

	data.forEach(datum => {
		const sectorIncluded = datum.cvaData?.some(cva =>
			sectorCountries.includes(cva.sectorId)
		);

		if (
			yearCountries.includes(datum.year) &&
			sectorIncluded &&
			partnerCountries.includes(datum.organizationId)
		) {
			if (datum.cvaData !== null) {
				const thisAllocationSourceAbbreviation =
					lists.allocationSourcesAbbreviated[
						datum.allocationSource
					].toLocaleLowerCase() as AllocationWindows;

				datum.cvaData.forEach(cva => {
					const foundCountry = dataCountries.find(
						country => country.country === datum.fund
					);

					if (foundCountry) {
						foundCountry.allocations += cva.budget;
						foundCountry[thisAllocationSourceAbbreviation] +=
							cva.budget;
					} else {
						const newCountry: DatumCountries = {
							country: datum.fund,
							allocations: cva.budget,
							rr: 0,
							ufe: 0,
							latitude:
								lists.fundCoordinates[datum.fund].latitude,
							longitude:
								lists.fundCoordinates[datum.fund].longitude,
						};
						newCountry[thisAllocationSourceAbbreviation] =
							cva.budget;

						dataCountries.push(newCountry);
					}
				});
			}
		}

		if (yearCountries.includes(datum.year) && sectorIncluded) {
			inSelectionDataCountries.partnersCountries.add(
				datum.organizationId
			);
		}

		if (
			yearCountries.includes(datum.year) &&
			partnerCountries.includes(datum.organizationId)
		) {
			if (datum.cvaData !== null) {
				datum.cvaData.forEach(cva => {
					inSelectionDataCountries.sectorsCountries.add(cva.sectorId);
				});
			}
		}

		if (sectorIncluded && partnerCountries.includes(datum.organizationId)) {
			inSelectionDataCountries.yearsCountries.add(datum.year);
		}
	});

	dataCountries.sort((a, b) => b.allocations - a.allocations);

	return {
		dataCountries,
		inSelectionDataCountries,
	};
}

export default processDataCountries;
