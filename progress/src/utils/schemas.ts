import { z } from "zod";

const splitRegex = /^(\d*\|\d*\|\d*\|\d*\|\d*)$/,
	dateRegex =
		/\b([1-9]|0[1-9]|1[012])\/([1-9]|0[1-9]|1[0-9]|2[0-9]|3[01])\/20\d\d\b/;

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
	EndDate: z.string().regex(dateRegex, "Invalid date format"),
	Budget: z.number().nonnegative(),
	BenM: z.number().int().nonnegative(),
	BenW: z.number().int().nonnegative(),
	BenB: z.number().int().nonnegative(),
	BenG: z.number().int().nonnegative(),
	GMId: z.union([z.number(), z.string()]).nullable(),
	GAMId: z.number().nullable(),
	GlbPrjStatusId: z.number().int().nonnegative(),
	GlobalUniqueOrgId: z.number().int().nonnegative(),
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
	TargetMen: z.number().int().nonnegative(),
	TargetWomen: z.number().int().nonnegative(),
	TargetBoys: z.number().int().nonnegative(),
	TargetGirls: z.number().int().nonnegative(),
	ActualMen: z.number().int().nonnegative(),
	ActualWomen: z.number().int().nonnegative(),
	ActualBoys: z.number().int().nonnegative(),
	ActualGirls: z.number().int().nonnegative(),
	GlobalInstanceStatusId: z.number().int().nonnegative().nullable(),
	SubmissionDate: z.string().regex(dateRegex, "Invalid date format"),
});

// ********************
// MASTER TABLES SCHEMAS
// ********************

export const allocationTypeMasterObjectSchema = z.object({
	AllocationTitle: z.string(),
	AllocationSummary: z.string(),
	AllocationSource: z.string(),
	AllocationSourceId: z.union([z.literal(1), z.literal(2)]),
	TotalUSDPlanned: z.number().nonnegative(),
	PlannedStartDate: z
		.string()
		.regex(dateRegex, "Invalid date format")
		.nullable(),
	PlannedEndDate: z
		.string()
		.regex(dateRegex, "Invalid date format")
		.nullable(),
	Documents: z.string().nullable(),
	PooledFundId: z.number().int().nonnegative(),
	PooledFundName: z.string(),
	AllocationYear: z.number().int().nonnegative(),
	HRPPlans: z.string().nullable(),
	AllocationHCLastProjectApprovalDate: z
		.string()
		.regex(dateRegex, "Invalid date format")
		.nullable(),
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
	EligibleSince: z
		.string()
		.regex(dateRegex, "Invalid date format")
		.nullable(),
	FirstAllocationDate: z
		.string()
		.regex(dateRegex, "Invalid date format")
		.nullable(),
	GlobalOrgId: z.number().int().nonnegative().nullable(),
	GlobalUniqueId: z.number().int().nonnegative(),
	LocalizationMarker: z.string().nullable(),
	OrgIsWLO: z.string().nullable(),
	OrgIsWRO: z.string().nullable(),
	OrgIsOPD: z.string().nullable(),
	OrgIsYLO: z.string().nullable(),
	UNPPId: z.union([z.number(), z.string()]).nullable(),
});

export const projectStatusMasterObjectSchema = z.object({
	GlobalInstanceStatusId: z.number().int().nonnegative(),
	StatusName: z.string(),
	StatusCode: z.string(),
	AllocSrc: z.union([z.literal(1), z.literal(2)]),
	InstanceTypeId: z.number().int().nonnegative(),
	PooledFundId: z.number().int().nonnegative(),
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

// ********************
// TYPES
// ********************

export type ProjectSummaryObject = z.infer<typeof projectSummaryObjectSchema>;

export type SectorBeneficiaryObject = z.infer<
	typeof sectorBeneficiaryObjectSchema
>;

export type AllocationTypeMasterObject = z.infer<
	typeof allocationTypeMasterObjectSchema
>;

export type OrganizationMasterObject = z.infer<
	typeof organizationMasterObjectSchema
>;

export type ProjectStatusMasterObject = z.infer<
	typeof projectStatusMasterObjectSchema
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