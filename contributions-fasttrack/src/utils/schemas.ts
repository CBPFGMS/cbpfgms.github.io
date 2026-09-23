import { z } from "zod";
import { constants } from "./constants";

const { USCountryId } = constants;

// ********************
// DATA SCHEMAS
// ********************

export const contributionsObjectSchema = z.object({
	PooledFundId: z.number().int().nonnegative(),
	PooledFundName: z.string(),
	PooledFundCodeAbbrv: z.string().nullable(),
	ContributionCode: z.string().nullable(),
	FiscalYear: z.number().int().nonnegative(),
	DonorName: z.string().nullable(),
	DonorCode: z.number().nullable(),
	GMSDonorID: z.literal(USCountryId, {
		error: "not-US",
	}),
	GMSDonorName: z.string().nullable(),
	CountryCode: z.string().nullable(),
	PledgeDate: z.string().nullable(),
	PledgeAmt: z.number().nonnegative(),
	PipeLineDate: z.string().nullable(),
	PaidDate: z.string(),
	PaidAmt: z.number().nonnegative(),
	ExpectedDate: z.string().nullable(),
	PledgeAmtLocalCurrency: z.string().nullable(),
	PledgeAmtCurrencyExchangeRate: z.number().nullable(),
	PaidAmtLocalCurrency: z.string().nullable(),
	PaidAmtCurrencyExchangeRate: z.number().nullable(),
	PledgeAmtLocal: z.number().nullable(),
	PaidAmtLocal: z.number().nullable(),
	IsTransfer: z.number().nullable(),
});

// ********************
// MASTER TABLES SCHEMAS
// ********************

export const regionalFundsMasterObjectSchema = z.object({
	CBPFId: z.number().int().nonnegative(),
	FundLevel: z.number().nullable(),
	ProgrammeCBPFId: z.number().nullable(),
	ProgrammeParentAbbrv: z.any().nullable(),
	RFundAbbrv: z.string(),
	RFundName: z.string(),
	RFundTitle: z.string(),
	StartYearDate: z.string().nullable(),
});

export const pooledFundsMasterObjectSchema = z.object({
	PFId: z.number().int().nonnegative(),
	PFName: z.string(),
	PFAbbrv: z.string(),
	PFLat: z.number(),
	PFLong: z.number(),
	PFCountryCode: z.string().length(2),
	MAAgent: z.string(),
	AAgent: z.string(),
	IsPublic: z.string(),
});

// ********************
// TYPES
// ********************

export type ContributionsObject = z.infer<typeof contributionsObjectSchema>;

export type RegionalFundsMasterJson = {
	count: number;
	funds: z.infer<typeof regionalFundsMasterObjectSchema>[];
};

export type PooledFundsMasterObject = z.infer<
	typeof pooledFundsMasterObjectSchema
>;
