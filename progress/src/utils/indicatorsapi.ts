import { csv, autoType } from "d3";
import {
	GlobalIndicatorsObject,
	globalIndicatorsObjectSchema,
} from "./schemas";
import warnInvalidSchema from "./warninvalid";
import processDataIndicators from "./processdataindicators";
import { DatumIndicators } from "./processdataindicators";

type IndicatorsApiParams = {
	setIndicatorsData: React.Dispatch<
		React.SetStateAction<DatumIndicators[] | null>
	>;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setError: React.Dispatch<React.SetStateAction<string | null>>;
	setHasFetchedData: React.Dispatch<React.SetStateAction<boolean>>;
};

function indicatorsApi({
	setIndicatorsData,
	setLoading,
	setError,
	setHasFetchedData,
}: IndicatorsApiParams) {
	const globalIndicatorsUrl = "../data/fake_indicatorsdata.csv";
	setLoading(true);
	csv<GlobalIndicatorsObject>(globalIndicatorsUrl, autoType)
		.then(rawData => {
			const data: GlobalIndicatorsObject[] = [];
			rawData.forEach(row => {
				const parsedRow = globalIndicatorsObjectSchema.safeParse(row);
				if (parsedRow.success) {
					data.push(parsedRow.data);
				} else {
					warnInvalidSchema(
						"Global indicators",
						row,
						JSON.stringify(parsedRow.error)
					);
				}
			});
			const dataIndicators = processDataIndicators({ data });
			setIndicatorsData(dataIndicators);
			setHasFetchedData(true);
			setLoading(false);
		})
		.catch((error: unknown) => {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("An unknown error occurred");
			}
			setHasFetchedData(false);
			setLoading(false);
		});
}

export default indicatorsApi;
