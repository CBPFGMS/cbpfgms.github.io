import { z } from "zod";

//this regex allows only digits and double hashtag symbol, e.g: "5396##7936##18031##16737". Eventually a trailing part with "|||" and another set of digits and double hashtags can be added, e.g: "5396##7936##18031##16737|||5396##7936##18031##16737". This is used for the sector and administrative location aggregation fields.
const digitsPipesAndHashtagRegex =
		/^\d+(?:##\d+){3}(?:\|\|\|\d+(?:##\d+){3})*$/,
	digitsPipesAndHashtagErrorMessage =
		"String doesn't match the expected format of digits and double hashtags (e.g., '5396##7936##18031##16737' or '5396##7936##18031##16737|||5396##7936##18031##16737')";

//this regex checks for a correct latitude/longitude pair, comma separated.
const latLongRegex = /^[-+]?\d+(\.\d+)?,\s*[-+]?\d+(\.\d+)?$/,
	latLongErrorMessage =
		"String must be a valid coordinate pair (e.g., '15.56, 32.51')";

const digitsAndHashtagRegex = /^(?:\d|##)+$/,
	digitsAndHashtagErrorMessage =
		"String doesn't match the expected format of digits and double hashtags (e.g., '5396##7936##18031##16737')";

const digitsDotsAndPipesRegex = /^\d+(\.\d+)?(\|{3}\d+(\.\d+)?)*$/,
	digitsDotsAndPipesErrorMessage =
		"String doesn't match the expected format of digits and triple pipes (e.g., '5396|||7936|||18031|||16737')";

// ********************
// DATA SCHEMAS
// ********************

export const projectSummaryAggregatedObjectSchema = z.object({
	PFId: z.number().int().nonnegative(),
	PrjCode: z.string(),
	ClstAgg: z.union([z.string(), z.number()]),
	ClstPrct: z.union([z.string(), z.number()]),
	AdmLocTypeIdAgg: z
		.string()
		.regex(digitsAndHashtagRegex, digitsAndHashtagErrorMessage),
	LocationBeneficiaryID: z.number().int().nonnegative(),
	AdmLoc1: z.string(),
	AdmLoc2: z.string().nullable(),
	AdmLoc3: z.string().nullable(),
	AdmLoc4: z.string().nullable(),
	AdmLoc5: z.string().nullable(),
	AdmLoc6: z.string().nullable(),
	AdmLocBenClustAgg1: z
		.string()
		.regex(digitsPipesAndHashtagRegex, digitsPipesAndHashtagErrorMessage),
	AdmLocBenClustAgg2: z
		.string()
		.regex(digitsPipesAndHashtagRegex, digitsPipesAndHashtagErrorMessage)
		.nullable(),
	AdmLocBenClustAgg3: z
		.string()
		.regex(digitsPipesAndHashtagRegex, digitsPipesAndHashtagErrorMessage)
		.nullable(),
	AdmLocBenClustAgg4: z
		.string()
		.regex(digitsPipesAndHashtagRegex, digitsPipesAndHashtagErrorMessage)
		.nullable(),
	AdmLocBenClustAgg5: z
		.string()
		.regex(digitsPipesAndHashtagRegex, digitsPipesAndHashtagErrorMessage)
		.nullable(),
	AdmLocBenClustAgg6: z
		.string()
		.regex(digitsPipesAndHashtagRegex, digitsPipesAndHashtagErrorMessage)
		.nullable(),
	AdmLocCord1: z.string().regex(latLongRegex, latLongErrorMessage),
	AdmLocCord2: z.string().regex(latLongRegex, latLongErrorMessage).nullable(),
	AdmLocCord3: z.string().regex(latLongRegex, latLongErrorMessage).nullable(),
	AdmLocCord4: z.string().regex(latLongRegex, latLongErrorMessage).nullable(),
	AdmLocCord5: z.string().regex(latLongRegex, latLongErrorMessage).nullable(),
	AdmLocCord6: z.string().regex(latLongRegex, latLongErrorMessage).nullable(),
	AdmLocClustBdg1: z.union([
		z.number(),
		z
			.string()
			.regex(digitsDotsAndPipesRegex, digitsDotsAndPipesErrorMessage),
	]),
	AdmLocClustBdg2: z
		.union([
			z.number(),
			z
				.string()
				.regex(digitsDotsAndPipesRegex, digitsDotsAndPipesErrorMessage),
		])
		.nullable(),
	AdmLocClustBdg3: z
		.union([
			z.number(),
			z
				.string()
				.regex(digitsDotsAndPipesRegex, digitsDotsAndPipesErrorMessage),
		])
		.nullable(),
	AdmLocClustBdg4: z
		.union([
			z.number(),
			z
				.string()
				.regex(digitsDotsAndPipesRegex, digitsDotsAndPipesErrorMessage),
		])
		.nullable(),
	AdmLocClustBdg5: z
		.union([
			z.number(),
			z
				.string()
				.regex(digitsDotsAndPipesRegex, digitsDotsAndPipesErrorMessage),
		])
		.nullable(),
	AdmLocClustBdg6: z
		.union([
			z.number(),
			z
				.string()
				.regex(digitsDotsAndPipesRegex, digitsDotsAndPipesErrorMessage),
		])
		.nullable(),
	AYr: z.number().int().nonnegative(),
});

export const projectSummaryObjectSchema = z.object({
	PFId: z.number().int().nonnegative(),
	AllNm: z.string(),
	PrjCode: z.string(),
	OPSCodeAgg: z.string().nullable(),
	EmgAgg: z.string().nullable(),
	AllYr: z.number().int().nonnegative(),
	AllSrc: z.number().int().nonnegative(),
	OrgNm: z.string(),
	OrgTypeId: z.number().int().nonnegative(),
	PrjTitle: z.string(),
	AStrDt: z.coerce.date(),
	AEndDt: z.coerce.date(),
	PrjDur: z.string(),
	PrgBdg: z.number().nonnegative(),
	BgdDC: z.number().nonnegative(),
	BdgSC: z.number().nonnegative(),
	PrjSubDt: z.coerce.date(),
	BenAgg: z.string(),
	PrjGM: z.string(),
	PrjStsNm: z.string(),
	PrjStsId: z.number().int().nonnegative(),
	PrjStsCode: z.string(),
	PartCode: z.number(),
	ApprDt: z.coerce.date(),
});

export const activitiesObjectSchema = z.object({
	PooledFundId: z.number().int().nonnegative(),
	PooledFundName: z.string(),
	CHFId: z.number().int().nonnegative(),
	CHFProjectCode: z.string(),
	OrganizationName: z.string(),
	OrganizationAcronym: z.string(),
	OrganizationType: z.string(),
	ClusterId: z.number().int().nonnegative(),
	ClusterName: z.string(),
	LocationBeneficiaryId: z.number().int().nonnegative(),
	ActivityCode: z.string(),
	StandardActivityID: z.number().int().nonnegative().nullable(),
	GlobalStandardActivityID: z.number().int().nonnegative(),
	GlobalClusterId: z.number().int().nonnegative(),
});

// ********************
// MASTER TABLES SCHEMAS
// ********************

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
	ParentPFId: z.number().int().nonnegative().nullable(),
});

export const sectorsMasterObjectSchema = z.object({
	ClustId: z.number().int().nonnegative(),
	ClustNm: z.string(),
	ClustCode: z.string(),
});

export const organizationTypesMasterObjectSchema = z.object({
	OrgTypeId: z.number().int().nonnegative(),
	OrgTypeNm: z.string(),
	OrgTypeCode: z.string(),
});

export const allocationSourcesMasterObjectSchema = z.object({
	AllSrcId: z.number().int().nonnegative(),
	AllNm: z.string(),
	AllSrcCode: z.string(),
});

export const activitiesMasterObjectSchema = z.object({
	ID: z.number(),
	ActivityName: z.string(),
	CommClstrId: z.number(),
	Year: z.number(),
});

// ********************
// TYPES
// ********************

export type ProjectSummaryAggregatedObject = z.infer<
	typeof projectSummaryAggregatedObjectSchema
>;

export type ProjectSummaryObject = z.infer<typeof projectSummaryObjectSchema>;

export type ActivitiesObject = z.infer<typeof activitiesObjectSchema>;

export type PooledFundsMasterObject = z.infer<
	typeof pooledFundsMasterObjectSchema
>;

export type SectorsMasterObject = z.infer<typeof sectorsMasterObjectSchema>;

export type OrganizationTypesMasterObject = z.infer<
	typeof organizationTypesMasterObjectSchema
>;

export type AllocationSourcesMasterObject = z.infer<
	typeof allocationSourcesMasterObjectSchema
>;

export type ActivitiesMasterObject = z.infer<
	typeof activitiesMasterObjectSchema
>;
