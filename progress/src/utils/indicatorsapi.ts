import { csv, autoType } from "d3";
import { GlobalIndicatorObject, globalIndicatorObjectSchema } from "./schemas";
import warnInvalidSchema from "./warninvalid";

type IndicatorsApiParams = {
	setRawDataIndicators: React.Dispatch<
		React.SetStateAction<GlobalIndicatorObject[] | null>
	>;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setError: React.Dispatch<React.SetStateAction<string | null>>;
	setHasFetchedData: React.Dispatch<React.SetStateAction<boolean>>;
};

function indicatorsApi({
	setRawDataIndicators,
	setLoading,
	setError,
	setHasFetchedData,
}: IndicatorsApiParams) {
	const globalIndicatorsUrl = "../data/global_indicators.csv";
	setLoading(true);
	csv<GlobalIndicatorObject>(globalIndicatorsUrl, autoType)
		.then(rawData => {
			const data: GlobalIndicatorObject[] = [];
			rawData.forEach(row => {
				const parsedRow = globalIndicatorObjectSchema.safeParse(row);
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
			setRawDataIndicators(data);
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
