import {
	type RegionalFundsMasterObject,
	regionalFundsMasterObjectSchema,
} from "./schemas";
import warnInvalidSchema from "./warninvalid";

type MakeListParams = {
	regionalFundsMaster: RegionalFundsMasterObject[];
};

export type List = {
	regionalFundNames: { [fundAbbreviation: string]: string };
	fundsInRegionalFunds: { [fundAbbreviation: string]: Set<string> };
	parentRegionalFundForFund: { [fundName: string]: string };
};

function makeLists({ regionalFundsMaster }: MakeListParams): List {
	const lists: List = {
		regionalFundNames: {},
		fundsInRegionalFunds: {},
		parentRegionalFundForFund: {},
	};

	regionalFundsMaster.forEach(row => {
		const parsedRegionalFundsMaster =
			regionalFundsMasterObjectSchema.safeParse(row);

		if (!parsedRegionalFundsMaster.success) {
			warnInvalidSchema(
				"regionalFundsMaster",
				row,
				parsedRegionalFundsMaster.error.message,
			);
			return;
		}

		lists.regionalFundNames[row.RFundAbbrv] = row.RFundTitle;
		const funds = (lists.fundsInRegionalFunds[row.RFundAbbrv] ??=
			new Set<string>());
		funds.add(row.RFundName);
		lists.parentRegionalFundForFund[row.RFundName] = row.RFundAbbrv;
	});

	return lists;
}

export default makeLists;
