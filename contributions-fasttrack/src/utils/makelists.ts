import {
	type RegionalFundsMasterJson,
	type PooledFundsMasterObject,
	pooledFundsMasterObjectSchema,
	regionalFundsMasterObjectSchema,
} from "./schemas";
import warnInvalidSchema from "./warninvalid";

type MakeListParams = {
	regionalFundsMaster: RegionalFundsMasterJson;
	pooledFundsMaster: PooledFundsMasterObject[];
};

export type List = {
	regionalFundNames: { [regionalFundAbbreviation: string]: string };
	fundsInRegionalFunds: { [regionalFundAbbreviation: string]: Set<number> };
	parentRegionalFundForFund: { [fundId: number]: string };
	fundNames: { [fundId: number]: string };
	fundAbbreviatedNames: { [fundId: number]: string };
	fundIsoCodes: { [fundId: number]: string };
};

function makeLists({
	regionalFundsMaster,
	pooledFundsMaster,
}: MakeListParams): List {
	const lists: List = {
		regionalFundNames: {},
		fundsInRegionalFunds: {},
		parentRegionalFundForFund: {},
		fundNames: {},
		fundAbbreviatedNames: {},
		fundIsoCodes: {},
	};

	regionalFundsMaster.funds.forEach(row => {
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

		lists.regionalFundNames[row.RFundAbbrv.toLowerCase()] = row.RFundTitle;
		const funds = (lists.fundsInRegionalFunds[
			row.RFundAbbrv.toLowerCase()
		] ??= new Set<number>());
		funds.add(row.CBPFId);
		lists.parentRegionalFundForFund[row.CBPFId] =
			row.RFundAbbrv.toLowerCase();
	});

	pooledFundsMaster.forEach(d => {
		const parsedFundMaster = pooledFundsMasterObjectSchema.safeParse(d);
		if (parsedFundMaster.success) {
			lists.fundNames[d.PFId] = d.PFName;
			lists.fundAbbreviatedNames[d.PFId] = d.PFAbbrv;
			lists.fundIsoCodes[d.PFId] = d.PFCountryCode;
		} else {
			warnInvalidSchema(
				"PooledFundsMaster",
				d,
				parsedFundMaster.error.message,
			);
		}
	});

	return lists;
}

export default makeLists;
