import { GlobalIndicatorsObject } from "./schemas";
import { BeneficiariesObject, Beneficiaries } from "./processrawdata";
import { sum, mean } from "d3";
import constants from "./constants";

export type DatumIndicators = {
	sector: number;
	sectorData: SectorDatum[];
};

type SectorDatum = {
	outcome: string;
	indicatorId: number;
	unit: GlobalIndicatorsObject["Unit"];
	targeted: BeneficiariesObject;
	reached: BeneficiariesObject;
	temporaryTargeted?: BeneficiariesObjectWithArrays;
	temporaryReached?: BeneficiariesObjectWithArrays;
};

type BeneficiariesObjectWithArrays = {
	[K in Beneficiaries]: number[];
};

type ProcessDataIndicatorsParams = {
	data: GlobalIndicatorsObject[];
};

const { beneficiaryCategories } = constants;

function processDataIndicators({ data: rawData }: ProcessDataIndicatorsParams) {
	const dataIndicators: DatumIndicators[] = [];

	rawData.forEach(row => {
		const foundSector = dataIndicators.find(
			datum => datum.sector === row.Sector
		);

		if (foundSector) {
			const foundIndicator = foundSector.sectorData.find(
				sectorDatum => sectorDatum.indicatorId === row.IndicatorId
			);
			if (foundIndicator) {
				updateTemporaryData(
					foundIndicator.temporaryTargeted!,
					row,
					"Targeted"
				);
				updateTemporaryData(
					foundIndicator.temporaryReached!,
					row,
					"Reached"
				);
			} else {
				foundSector.sectorData.push({
					outcome: row.Outcome,
					indicatorId: row.IndicatorId,
					unit: row.Unit,
					targeted: fillWithZeroes(),
					reached: fillWithZeroes(),
					temporaryTargeted: populateTemporaryData(row, "Targeted"),
					temporaryReached: populateTemporaryData(row, "Reached"),
				});
			}
		} else {
			dataIndicators.push({
				sector: row.Sector,
				sectorData: [
					{
						outcome: row.Outcome,
						indicatorId: row.IndicatorId,
						unit: row.Unit,
						targeted: fillWithZeroes(),
						reached: fillWithZeroes(),
						temporaryTargeted: populateTemporaryData(
							row,
							"Targeted"
						),
						temporaryReached: populateTemporaryData(row, "Reached"),
					},
				],
			});
		}
	});

	dataIndicators.forEach(sectorDatum => {
		sectorDatum.sectorData.forEach(datum => {
			processObject(datum.temporaryTargeted!, datum.targeted, datum.unit);
			processObject(datum.temporaryReached!, datum.reached, datum.unit);

			delete datum.temporaryTargeted;
			delete datum.temporaryReached;
		});
	});

	console.log(dataIndicators);

	return dataIndicators;
}

function processObject(
	temporaryData: BeneficiariesObjectWithArrays,
	targetData: BeneficiariesObject,
	unit: GlobalIndicatorsObject["Unit"]
) {
	const operation = unit === "p" ? mean : sum;
	for (const key in temporaryData) {
		targetData[key as keyof typeof targetData] =
			operation(temporaryData[key as keyof typeof temporaryData]) ?? 0;
	}
}

function populateTemporaryData(
	row: GlobalIndicatorsObject,
	type: "Targeted" | "Reached"
) {
	const obj = {} as BeneficiariesObjectWithArrays;
	beneficiaryCategories.forEach(beneficiary => {
		obj[beneficiary] = [
			Number(
				row[
					`${type}${
						beneficiary.charAt(0).toUpperCase() +
						beneficiary.slice(1)
					}` as keyof GlobalIndicatorsObject
				]
			) || 0,
		];
	});
	return obj;
}

function updateTemporaryData(
	temporaryObject: BeneficiariesObjectWithArrays,
	row: GlobalIndicatorsObject,
	type: "Targeted" | "Reached"
) {
	beneficiaryCategories.forEach(beneficiary => {
		temporaryObject[beneficiary].push(
			Number(
				row[
					`${type}${
						beneficiary.charAt(0).toUpperCase() +
						beneficiary.slice(1)
					}` as keyof GlobalIndicatorsObject
				]
			) || 0
		);
	});
}

function fillWithZeroes(): BeneficiariesObject {
	const obj = {} as BeneficiariesObject;
	for (const key of beneficiaryCategories) {
		obj[key] = 0;
	}
	return obj;
}

export default processDataIndicators;
