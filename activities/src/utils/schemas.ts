import { z } from "zod";

//this regex allows only digits and double hashtag symbol, e.g: "5396##7936##18031##16737".
const digitsAndHashtagRegex = /^(?:\d|##)+$/,
	digitsAndHashtagErrorMessage =
		"String must contain only digits and double hashtags (##)";

//this regex checks for a correct latitude/longitude pair, comma separated.
const latLongRegex = /^[-+]?\d+(\.\d+)?,\s*[-+]?\d+(\.\d+)?$/,
	latLongErrorMessage =
		"String must be a valid coordinate pair (e.g., '15.56, 32.51')";

// ********************
// DATA SCHEMAS
// ********************

export const projectSummaryAggregatedObjectSchema = z.object({
	PFId: z.number().int().nonnegative(),
	PrjCode: z.string(),
	ClstAgg: z.string(),
	ClstPrct: z.number(),
	AdmLocTypeIdAgg: z
		.string()
		.regex(digitsAndHashtagRegex, digitsAndHashtagErrorMessage),
	AdmLoc1: z.string(),
	AdmLoc2: z.string().nullable(),
	AdmLoc3: z.string().nullable(),
	AdmLoc4: z.string().nullable(),
	AdmLoc5: z.string().nullable(),
	AdmLoc6: z.string().nullable(),
	AdmLocBenClustAgg1: z
		.string()
		.regex(digitsAndHashtagRegex, digitsAndHashtagErrorMessage),
	AdmLocBenClustAgg2: z
		.string()
		.regex(digitsAndHashtagRegex, digitsAndHashtagErrorMessage)
		.nullable(),
	AdmLocBenClustAgg3: z
		.string()
		.regex(digitsAndHashtagRegex, digitsAndHashtagErrorMessage)
		.nullable(),
	AdmLocBenClustAgg4: z
		.string()
		.regex(digitsAndHashtagRegex, digitsAndHashtagErrorMessage)
		.nullable(),
	AdmLocBenClustAgg5: z
		.string()
		.regex(digitsAndHashtagRegex, digitsAndHashtagErrorMessage)
		.nullable(),
	AdmLocBenClustAgg6: z
		.string()
		.regex(digitsAndHashtagRegex, digitsAndHashtagErrorMessage)
		.nullable(),
	AdmLocCord1: z.string().regex(latLongRegex, latLongErrorMessage),
	AdmLocCord2: z.string().regex(latLongRegex, latLongErrorMessage).nullable(),
	AdmLocCord3: z.string().regex(latLongRegex, latLongErrorMessage).nullable(),
	AdmLocCord4: z.string().regex(latLongRegex, latLongErrorMessage).nullable(),
	AdmLocCord5: z.string().regex(latLongRegex, latLongErrorMessage).nullable(),
	AdmLocCord6: z.string().regex(latLongRegex, latLongErrorMessage).nullable(),
	AdmLocClustBdg1: z.number().nonnegative(),
	AdmLocClustBdg2: z.number().nonnegative().nullable(),
	AdmLocClustBdg3: z.number().nonnegative().nullable(),
	AdmLocClustBdg4: z.number().nonnegative().nullable(),
	AdmLocClustBdg5: z.number().nonnegative().nullable(),
	AdmLocClustBdg6: z.number().nonnegative().nullable(),
	AYr: z.number().int().nonnegative(),
});

export const pooledFundsMasterObjectSchema = z.object({
	PFId: z.number().int().nonnegative(),
	PFName: z.string(),
	PFAbbrv: z.string(),
	PFLat: z.string(),
	PFLong: z.string(),
	PFCountryCode: z.string().length(2),
	MAAgent: z.string(),
	AAgent: z.string(),
	IsPublic: z.boolean(),
	ParentPFId: z.number().int().nonnegative().nullable(),
});

// ********************
// MASTER TABLES SCHEMAS
// ********************

// ********************
// TYPES
// ********************

export type ProjectSummaryAggregatedObject = z.infer<
	typeof projectSummaryAggregatedObjectSchema
>;

export type PooledFundsMasterObject = z.infer<
	typeof pooledFundsMasterObjectSchema
>;
