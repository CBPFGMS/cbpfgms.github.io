import {
	GlobalIndicatorsObject,
	globalIndicatorsObjectSchema,
} from "./schemas";
import warnInvalidSchema from "./warninvalid";
import processDataIndicators from "./processdataindicators";
import { DatumIndicators } from "./processdataindicators";
import { List } from "./makelists";
import fetchFileDB from "./fetchfiledb";

type IndicatorsApiParams = {
	setIndicatorsData: React.Dispatch<
		React.SetStateAction<DatumIndicators[] | null>
	>;
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setError: React.Dispatch<React.SetStateAction<string | null>>;
	lists: List;
	year: number[];
	fund: number[];
	allocationSource: number[];
	allocationType: number[];
	defaultFundType: number | null;
};

function indicatorsApi({
	setIndicatorsData,
	setLoading,
	setError,
	lists,
	year,
	fund,
	allocationSource,
	allocationType,
	defaultFundType,
}: IndicatorsApiParams) {
	const globalIndicatorsUrl = `https://cbpfapi.unocha.org/vo3/odata/GlobalGenericDataExtract?SPCode=PF_GLB_INDIC&PoolfundCodeAbbrv=&ShowAllPooledFunds=&AllocationYears=&IndicatorTypeId=&FundTypeId=${defaultFundType}&$format=csv`;
	setLoading(true);

	fetchFileDB<GlobalIndicatorsObject[]>(
		"globalIndicators",
		globalIndicatorsUrl,
		"csv"
	)
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
			const dataIndicators = processDataIndicators({
				data,
				lists,
				year,
				fund,
				allocationSource,
				allocationType,
			});
			setIndicatorsData(dataIndicators);
			setLoading(false);
		})
		.catch((error: unknown) => {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("An unknown error occurred");
			}
			setLoading(false);
		});
}

export default indicatorsApi;
