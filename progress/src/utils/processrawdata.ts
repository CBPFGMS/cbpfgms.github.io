import {
	ProjectSummaryV2,
	ArQuery18,
	arQuery18ObjectSchema,
	createProjectSummaryV2ObjectSchema,
} from "../schemas";
import { List } from "./makelists";
import warnInvalidSchema, { warnProjectNotFound } from "./warninvalid";
import binarySearch from "./binarysearch";

type Datum = {
	reached: BeneficiariesObject;
	targeted: BeneficiariesObject;
	fund: number;
	year: number;
};

export type Data = Datum[];

type beneficiaryTypes = "girls" | "boys" | "women" | "men";

type BeneficiariesObject = {
	[K in beneficiaryTypes]: number;
};

type ArQuery18ProcessedDatum = {
	sortValue: number;
	projectCode: string;
	reached: BeneficiariesObject;
};

type ArQuery18ProcessedData = ArQuery18ProcessedDatum[];

function processRawData(
	projectSummaryV2: ProjectSummaryV2,
	arQuery18: ArQuery18,
	listsObj: List
): Data {
	const data: Data = [];
	const arQuery18ProcessedData: ArQuery18ProcessedData = [];

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
			});
		} else {
			warnInvalidSchema(
				"arQuery18",
				row,
				JSON.stringify(parsedRow.error)
			);
		}
	});

	projectSummaryV2.forEach(row => {
		const parsedRow = dataSchema.safeParse(row);
		if (parsedRow.success) {
			// const objDatum: Datum = {
			// 	foo: row.PrjCode,
			// };
			// const projectNumericValue = projectNameToValue.get(row.PrjCode);
			// if (projectNumericValue !== undefined) {
			// 	const index = binarySearch(
			// 		arQuery18ProcessedData,
			// 		projectNumericValue,
			// 		"sortValue"
			// 	);
			// 	if (index !== -1) {
			// 	}
			// } else {
			// 	//warnProjectNotFound(row.PrjCode, row);
			// }
		} else {
			warnInvalidSchema(
				"projectSummaryV2",
				row,
				JSON.stringify(parsedRow.error)
			);
		}
	});

	return data;
}

export default processRawData;
