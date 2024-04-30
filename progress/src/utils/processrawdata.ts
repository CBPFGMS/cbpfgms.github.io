import {
	ProjectSummaryV2,
	ArQuery18,
	SectorsData,
	arQuery18ObjectSchema,
	createProjectSummaryV2ObjectSchema,
	sectorsDataObjectSchema,
} from "./schemas";
import { List } from "./makelists";
import warnInvalidSchema, { warnProjectNotFound } from "./warninvalid";
import binarySearch from "./binarysearch";

type Datum = {
	reached: BeneficiariesObject;
	targeted: BeneficiariesObject;
	fund: number;
	year: number;
	projectCode: string;
	allocationSource: number;
	organizationType: number;
	allocationType: string;
	startDate: Date;
	endDate: Date;
	budget: number;
	projectStatus: string;
	sector: number | null;
};

export type Data = Datum[];

type BeneficiaryTypes = "girls" | "boys" | "women" | "men";

type BeneficiariesObject = {
	[K in BeneficiaryTypes]: number;
};

type ArQuery18ProcessedDatum = {
	sortValue: number;
	projectCode: string;
	reached: BeneficiariesObject;
	sectors: {
		sectorId: number;
		percentage: number;
	}[];
};

type ArQuery18ProcessedData = ArQuery18ProcessedDatum[];

export type InDataLists = {
	years: Set<number>;
	sectors: Set<number>;
	allocationTypes: Set<string>;
	allocationSources: Set<number>;
	funds: Set<number>;
	organizationTypes: Set<number>;
};

function processRawData(
	projectSummaryV2: ProjectSummaryV2,
	arQuery18: ArQuery18,
	sectorsData: SectorsData,
	listsObj: List,
	setInDataLists: React.Dispatch<React.SetStateAction<InDataLists | null>>
): Data {
	const data: Data = [];
	const arQuery18ProcessedData: ArQuery18ProcessedData = [];

	const yearsSet = new Set<number>();
	const sectorsSet = new Set<number>();
	const allocationTypesSet = new Set<string>();
	const allocationSourcesSet = new Set<number>();
	const fundsSet = new Set<number>();
	const organizationTypesSet = new Set<number>();

	const projectNameToValue = new Map<string, number>();
	let nextValue = 0;

	const dataSchema = createProjectSummaryV2ObjectSchema(
		listsObj.masterFilesNumbers.numberOfFundsInMaster.size,
		listsObj.masterFilesNumbers.numberOfAllocationSourcesInMaster.size,
		listsObj.masterFilesNumbers.numberOfOrganizationTypesInMaster.size
	);

	arQuery18.forEach(row => {
		const parsedRow = arQuery18ObjectSchema.safeParse(row);
		if (parsedRow.success) {
			if (!projectNameToValue.has(row.ChfProjectCode)) {
				projectNameToValue.set(row.ChfProjectCode, nextValue);
				nextValue++;
			}
			arQuery18ProcessedData.push({
				sortValue: projectNameToValue.get(row.ChfProjectCode)!,
				projectCode: row.ChfProjectCode,
				reached: {
					men: row.Men,
					women: row.Women,
					boys: row.Boys,
					girls: row.Girls,
				},
				sectors: [],
			});
		} else {
			warnInvalidSchema(
				"arQuery18",
				row,
				JSON.stringify(parsedRow.error)
			);
		}
	});

	sectorsData.forEach(row => {
		const parsedRow = sectorsDataObjectSchema.safeParse(row);
		if (parsedRow.success) {
			const projectNumericValue = projectNameToValue.get(
				row.ChfProjectCode
			);
			if (projectNumericValue !== undefined) {
				const index = binarySearch(
					arQuery18ProcessedData,
					projectNumericValue,
					"sortValue"
				);
				if (index !== -1) {
					arQuery18ProcessedData[index].sectors.push({
						sectorId: row.SectorId,
						percentage: row.Percentage,
					});
				}
			} else {
				warnProjectNotFound(row.ChfProjectCode, row);
			}
		} else {
			warnInvalidSchema(
				"sectorsData",
				row,
				JSON.stringify(parsedRow.error)
			);
		}
	});

	projectSummaryV2.forEach(row => {
		const parsedRow = dataSchema.safeParse(row);
		if (parsedRow.success) {
			let onlyOneSector = true;

			yearsSet.add(row.AllYr);
			fundsSet.add(row.PFId);
			allocationSourcesSet.add(row.AllSrc);
			organizationTypesSet.add(row.OrgTypeId);
			allocationTypesSet.add(row.AllNm);

			const objDatum: Datum = {
				fund: row.PFId,
				year: row.AllYr,
				projectCode: row.PrjCode,
				allocationSource: row.AllSrc,
				organizationType: row.OrgTypeId,
				allocationType: row.AllNm,
				startDate: new Date(row.AStrDt),
				endDate: new Date(row.AEndDt),
				budget: row.PrgBdg,
				projectStatus: row.PrjStsNm,
				reached: {
					men: 0,
					women: 0,
					boys: 0,
					girls: 0,
				},
				targeted: {
					men: 0,
					women: 0,
					boys: 0,
					girls: 0,
				},
				sector: null,
			};
			const targetedPeopleArray = row.BenAgg.split("##");
			objDatum.targeted.men = parseInt(targetedPeopleArray[0]);
			objDatum.targeted.women = parseInt(targetedPeopleArray[1]);
			objDatum.targeted.boys = parseInt(targetedPeopleArray[2]);
			objDatum.targeted.girls = parseInt(targetedPeopleArray[3]);
			const projectNumericValue = projectNameToValue.get(row.PrjCode);
			if (projectNumericValue !== undefined) {
				const index = binarySearch(
					arQuery18ProcessedData,
					projectNumericValue,
					"sortValue"
				);
				if (index !== -1) {
					objDatum.reached = {
						...arQuery18ProcessedData[index].reached,
					};
					const sectorsInProject =
						arQuery18ProcessedData[index].sectors;
					if (sectorsInProject.length === 1) {
						objDatum.sector = sectorsInProject[0].sectorId;
						sectorsSet.add(sectorsInProject[0].sectorId);
					}
					if (sectorsInProject.length > 1) {
						onlyOneSector = false;
						sectorsInProject.forEach(sector => {
							sectorsSet.add(sector.sectorId);
							const objDatumCopy = { ...objDatum };
							objDatumCopy.sector = sector.sectorId;
							const percentage = sector.percentage / 100;
							objDatumCopy.budget *= percentage;
							for (const beneficiary in objDatumCopy.reached) {
								objDatumCopy.reached[
									beneficiary as BeneficiaryTypes
								] *= percentage;
							}
							for (const beneficiary in objDatumCopy.targeted) {
								objDatumCopy.reached[
									beneficiary as BeneficiaryTypes
								] *= percentage;
							}
							data.push(objDatumCopy);
						});
					}
				}
			} else {
				warnProjectNotFound(row.PrjCode, row);
			}
			if (onlyOneSector) {
				data.push(objDatum);
			}
		} else {
			warnInvalidSchema(
				"projectSummaryV2",
				row,
				JSON.stringify(parsedRow.error)
			);
		}
	});

	setInDataLists({
		years: yearsSet,
		sectors: sectorsSet,
		allocationTypes: allocationTypesSet,
		allocationSources: allocationSourcesSet,
		funds: fundsSet,
		organizationTypes: organizationTypesSet,
	});

	return data;
}

export default processRawData;
