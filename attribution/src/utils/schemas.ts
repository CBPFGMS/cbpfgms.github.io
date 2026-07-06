import { z } from "zod";

//regex for the beneficiary types
const splitRegex = /^(\d*\|\d*\|\d*\|\d*\|\d*)$/;
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

export const projectSummaryObjectSchema = z.object({
	FundType: z.union([z.literal(1), z.literal(2)]),
	PooledFundId: z.number().int().nonnegative(),
	AllocationtypeId: z.number().int().nonnegative(),
	ChfId: z.number().int().nonnegative(),
	ChfProjectCode: z.string(),
	OrgId: z.number().int().nonnegative(),
	PrjDuration: z.string(),
	EndDate: z.coerce.date(),
	Budget: z.number().nonnegative(),
	BenM: z.number().int().nonnegative(),
	BenW: z.number().int().nonnegative(),
	BenB: z.number().int().nonnegative(),
	BenG: z.number().int().nonnegative(),
	GMId: z.union([z.number(), z.string()]).nullable(),
	GAMId: z.number().nullable(),
	GlbPrjStatusId: z.number().nullable(),
	GlobalUniqueOrgId: z.number().int().nonnegative(),
	GlobalOrgId: z.number().int().nonnegative(), //change to GlobalOrgID
	DisabilityMarkerId: z.number().int().nonnegative().nullable(),
	GenderEqualityMarkerId: z.number().int().nonnegative().nullable(),
	GBVMarkerId: z.number().int().nonnegative().nullable(),
	GAMRefNumber: z.string().nullable(),
	PartnerProjectRisk: z.string().nullable(),
	PartnerRisk: z.string().nullable(),
	DisabledM: z.number().int().nonnegative().nullable(),
	DisabledW: z.number().int().nonnegative().nullable(),
	DisabledB: z.number().int().nonnegative().nullable(),
	DisabledG: z.number().int().nonnegative().nullable(),
	AchM: z.number().int().nonnegative().nullable(),
	AchW: z.number().int().nonnegative().nullable(),
	AchB: z.number().int().nonnegative().nullable(),
	AchG: z.number().int().nonnegative().nullable(),
	BenMSplit: z
		.string()
		.regex(splitRegex, "Invalid split string format")
		.nullable(),
	BenWSplit: z
		.string()
		.regex(splitRegex, "Invalid split string format")
		.nullable(),
	BenBSplit: z
		.string()
		.regex(splitRegex, "Invalid split string format")
		.nullable(),
	BenGSplit: z
		.string()
		.regex(splitRegex, "Invalid split string format")
		.nullable(),
	BenTotSplit: z
		.string()
		.regex(splitRegex, "Invalid split string format")
		.nullable(),
	AchMSplit: z
		.string()
		.regex(splitRegex, "Invalid split string format")
		.nullable(),
	AchWSplit: z
		.string()
		.regex(splitRegex, "Invalid split string format")
		.nullable(),
	AchBSplit: z
		.string()
		.regex(splitRegex, "Invalid split string format")
		.nullable(),
	AchGSplit: z
		.string()
		.regex(splitRegex, "Invalid split string format")
		.nullable(),
	AchTotSplit: z
		.string()
		.regex(splitRegex, "Invalid split string format")
		.nullable(),
	AchDisabledM: z.number().int().nonnegative().nullable(),
	AchDisabledW: z.number().int().nonnegative().nullable(),
	AchDisabledB: z.number().int().nonnegative().nullable(),
	AchDisabledG: z.number().int().nonnegative().nullable(),
	GBVBudget: z.number().nonnegative().nullable(),
	AchGBVBudget: z.number().nonnegative().nullable(),
	GBVPeopleTgt: z.number().int().nonnegative().nullable(),
	AchGBVPeople: z.number().int().nonnegative().nullable(),
	GendEqBudget: z.number().nonnegative().nullable(),
	AchGendEqBudget: z.number().nonnegative().nullable(),
	GendEqPeopleTgt: z.number().int().nonnegative().nullable(),
	AchGendEqPeople: z.number().int().nonnegative().nullable(),
	ProtBudget: z.number().nonnegative().nullable(),
	AchProtBudget: z.number().nonnegative().nullable(),
	ProtPeopleTgt: z.number().int().nonnegative().nullable(),
	AchProtPeople: z.number().int().nonnegative().nullable(),
	RptCode: z.union([z.literal(1), z.literal(2)]).nullable(),
	StartDate: z.coerce.date(),
	PrjApprDate: z.coerce.date().nullable(), //TEMPORARY
	CVATotPeople: z.number().int().nonnegative().nullable(),
	AchCVATotPeople: z.number().int().nonnegative().nullable(),
	ProjectStatusCode: z.string().nullable(),
	ProcessStatus: z.string(),
	ProcessSTatusID: z.number().int().nonnegative(),
});

export const sectorBeneficiaryObjectSchema = z.object({
	PooledFundName: z.string(),
	PooledFundId: z.number().int().nonnegative(),
	AllocationTypeId: z.number().int().nonnegative(),
	ChfId: z.number().int().nonnegative(),
	ChfProjectCode: z.string(),
	CountryClusterId: z.number().int().nonnegative(),
	GlobalClusterId: z.number().int().nonnegative(),
	Percentage: z.number().nonnegative(),
	CALCBudgetByCluster: z.number().nonnegative(),
	TargetMen: z.number().int().nonnegative().nullable(),
	TargetWomen: z.number().int().nonnegative().nullable(),
	TargetBoys: z.number().int().nonnegative().nullable(),
	TargetGirls: z.number().int().nonnegative().nullable(),
	ActualMen: z.number().int().nonnegative().nullable(),
	ActualWomen: z.number().int().nonnegative().nullable(),
	ActualBoys: z.number().int().nonnegative().nullable(),
	ActualGirls: z.number().int().nonnegative().nullable(),
	GlobalInstanceStatusId: z.number().int().nonnegative().nullable(),
	SubmissionDate: z.coerce.date().nullable(),
});

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

// export const contributionsObjectSchema = z.object({
// 	FiscalYear: z.number().int().nonnegative(),
// 	GMSDonorName: z.string(),
// 	GMSDonorISO2Code: z.string(),
// 	PooledFundName: z.string(),
// 	PooledFundISO2Code: z.string(),
// 	PaidAmt: z.number(),
// 	PledgeAmt: z.number(),
// 	PledgeAmtLocalCurrency: z.string(),
// 	PledgeAmtCurrencyExchangeRate: z.number(),
// 	PaidAmtLocalCurrency: z.string(),
// 	PaidAmtCurrencyExchangeRate: z.number(),
// 	PledgeAmtLocal: z.number(),
// 	PaidAmtLocal: z.number(),
// 	IsTransfer: z.coerce.boolean(),
// });

export const contributionsObjectSchema = z.object({
	PooledFundName: z.string(),
	PooledFundId: z.number(),
	FiscalYear: z.number(),
	DonorName: z.string(),
	DonorCode: z.number(),
	GMSDonorId: z.number(),
	GMSDonorName: z.string(),
	ContributionAmt: z.number(),
	ContributionPercent: z.number(),
});

// ********************
// MASTER TABLES SCHEMAS
// ********************

export const allocationTypesMasterObjectSchema = z.object({
	AllocationTitle: z.string(),
	AllocationSummary: z.string().nullable(),
	AllocationSource: z.string(),
	AllocationSourceId: z.number().int().nonnegative(),
	TotalUSDPlanned: z.number().nonnegative().nullable(),
	PlannedStartDate: z.coerce.date().nullable(),
	PlannedEndDate: z.coerce.date().nullable(),
	Documents: z.string().nullable(),
	PooledFundId: z.number().int().nonnegative(),
	PooledFundName: z.string(),
	AllocationYear: z.number().int().nonnegative(),
	HRPPlans: z.string().nullable(),
	AllocationHCLastProjectApprovalDate: z.coerce.date().nullable(),
	TotalProjectsunderApproval: z.number().int().nonnegative(),
	TotalUnderApprovalBudget: z.number().nonnegative(),
	TotalProjectsApproved: z.number().int().nonnegative(),
	TotalApprovedBudget: z.number().nonnegative(),
	AllocationTypeId: z.number().int().nonnegative(),
	FundTypeId: z.union([z.literal(1), z.literal(2)]),
});

export const organizationMasterObjectSchema = z.object({
	PooledFundId: z.number().int().nonnegative(),
	FundTypeId: z.union([z.literal(1), z.literal(2)]),
	OrganizationId: z.number().int().nonnegative(),
	PooledFundName: z.string(),
	OrganizationName: z.string(),
	OrganizationAcronym: z.string(),
	OrganizationTypeId: z.union([
		z.literal(1),
		z.literal(2),
		z.literal(3),
		z.literal(4),
	]),
	OrganizationTypeName: z.string(),
	AlternateName: z.string().nullable(),
	DueDiligenceStatus: z.string().nullable(),
	IsEligible: z.string().nullable(),
	EligibleSince: z.coerce.date().nullable(),
	FirstAllocationDate: z.coerce.date().nullable(),
	GlobalOrgId: z.number().int().nonnegative(),
	GlobalOrgName: z.string(),
	GlobalOrgAcronym: z.string(),
	GlobalUniqueId: z.number().int().nonnegative(),
	LocalizationMarker: z.string().nullable(),
	OrgIsWLO: z.string().nullable().optional(),
	OrgIsWRO: z.string().nullable().optional(),
	OrgIsOPD: z.string().nullable().optional(),
	OrgIsYLO: z.string().nullable().optional(),
	UNPPId: z.union([z.number(), z.string()]).nullable(),
});

export const beneficiaryTypesMasterObjectSchema = z.object({
	BeneficiaryTypeId: z.number().int().nonnegative(),
	BeneficiaryType: z.string(),
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

export const allocationSourcesMasterObjectSchema = z.object({
	AllSrcId: z.number().int().nonnegative(),
	AllNm: z.string(),
	AllSrcCode: z.string().length(1),
});

export const organizationTypesMasterObjectSchema = z.object({
	OrgTypeId: z.union([
		z.literal(1),
		z.literal(2),
		z.literal(3),
		z.literal(4),
	]),
	OrgTypeNm: z.string(),
	OrgTypeCode: z.string(),
});

export const sectorsMasterObjectSchema = z.object({
	ClustId: z.number().int().nonnegative(),
	ClustNm: z.string(),
	ClustCode: z.string(),
});

export const pooledFundsWithRegionMasterObjectSchema = z.object({
	id: z.number().int().nonnegative(),
	PooledFundName: z.string(),
	PooledFundNameAbbrv: z.string(),
	RegionName: z.string(),
	RegionNameArr: z.string(),
	SubRegionName: z.string(),
	ContinentName: z.string(),
	CountryCode: z.string(),
	ISO2Code: z.string(),
	latitude: z.union([z.number(), z.string()]),
	longitude: z.union([z.number(), z.string()]),
	CBPFFundStatus: z.string().nullable(),
	CBPFId: z.union([z.number().int().nonnegative(), z.string()]),
	CERFId: z.union([z.number().int().nonnegative(), z.string()]),
	AreaType: z.string(),
});

export const donorsMasterObjectSchema = z.object({
	DonorName: z.string(),
	CountryName: z.string().nullable(),
	DonorID: z.number(),
	DonorMapID: z.number(),
	DonorNativeCurrency: z.string().nullable(),
	DonorNativeCurrencyAbbrv: z.string().nullable(),
	GNP: z.number(),
	GDP: z.number(),
	Population: z.number(),
	FootNote: z.string().nullable(),
	FootNote_Date: z.string().nullable(),
	Longitude: z.number().nullable(),
	Latitude: z.number().nullable(),
	CountryISO2: z.string().nullable(),
	CountryISO3: z.string().nullable(),
});

// ********************
// TYPES
// ********************

export type ProjectSummaryObject = z.infer<typeof projectSummaryObjectSchema>;

export type SectorBeneficiaryObject = z.infer<
	typeof sectorBeneficiaryObjectSchema
>;

export type ProjectSummaryAggregatedObject = z.infer<
	typeof projectSummaryAggregatedObjectSchema
>;

export type ContributionsObject = z.infer<typeof contributionsObjectSchema>;

export type AllocationTypesMasterObject = z.infer<
	typeof allocationTypesMasterObjectSchema
>;

export type OrganizationMasterObject = z.infer<
	typeof organizationMasterObjectSchema
>;

export type BeneficiaryTypesMasterObject = z.infer<
	typeof beneficiaryTypesMasterObjectSchema
>;

export type PooledFundsMasterObject = z.infer<
	typeof pooledFundsMasterObjectSchema
>;

export type AllocationSourcesMasterObject = z.infer<
	typeof allocationSourcesMasterObjectSchema
>;

export type OrganizationTypesMasterObject = z.infer<
	typeof organizationTypesMasterObjectSchema
>;

export type SectorsMasterObject = z.infer<typeof sectorsMasterObjectSchema>;

export type PooledFundsWithRegionMasterObject = z.infer<
	typeof pooledFundsWithRegionMasterObjectSchema
>;

export type DonorsMasterObject = z.infer<typeof donorsMasterObjectSchema>;
