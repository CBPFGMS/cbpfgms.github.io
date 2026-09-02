import { z } from "zod";

// ********************
// DATA SCHEMAS
// ********************

export const contributionsObjectSchema = z.object({
	FiscalYear: z.number().int().nonnegative(),
	GMSDonorName: z.string().nullish(),
	GMSDonorISO2Code: z.literal("US", {
		error: "not-US",
	}),
	PooledFundName: z.string(),
	PooledFundISO2Code: z.string(),
	PaidAmt: z.number().nonnegative(),
	PledgeAmt: z.number().nonnegative(),
	PledgeAmtLocalCurrency: z.string().nullish(),
	PledgeAmtCurrencyExchangeRate: z.number().nullish(),
	PaidAmtLocalCurrency: z.string().nullish(),
	PaidAmtCurrencyExchangeRate: z.number().nullish(),
	PledgeAmtLocal: z.number().nullish(),
	PaidAmtLocal: z.number().nullish(),
	IsTransfer: z.number().nullish(),
	DatePaid: z.coerce.date(), //FIX: this doesn't exist yet in the raw data
});

// ********************
// MASTER TABLES SCHEMAS
// ********************

export const regionalFundsMasterObjectSchema = z.object({
	RFundTitle: z.string(),
	RFundAbbrv: z.string(),
	RFundName: z.string(),
	StartYearDate: z.string().nullish(),
	CBPFId: z.number().nullish(),
});

// ********************
// TYPES
// ********************

export type ContributionsObject = z.infer<typeof contributionsObjectSchema>;

export type RegionalFundsMasterObject = z.infer<
	typeof regionalFundsMasterObjectSchema
>;
