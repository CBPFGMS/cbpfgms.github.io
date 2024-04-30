import { z } from "zod";

const splitRegex = /^(\d*\|\d*\|\d*\|\d*\|\d*)$/,
	dateRegex = /\b(0[1-9]|1[0-9]|2[0-9]|3[01])\/(0[1-9]|1[012])\/20\d\d\b/;

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
	GMId: z.string().nullable(),
	GAMId: z.number().nullable(),
	GlbPrjStatusId: z.number().int().nonnegative(),
	GlobalUniqueOrgId: z.number().int().nonnegative(),
	DisabilityMarkerId: z.number().int().nonnegative(),
	GenderEqualityMarkerId: z.number().int().nonnegative(),
	GBVMarkerId: z.number().int().nonnegative(),
	GAMRefNumber: z.string(),
	PartnerProjectRisk: z.string(),
	PartnerRisk: z.string(),
	DisabledM: z.number().int().nonnegative(),
	DisabledW: z.number().int().nonnegative(),
	DisabledB: z.number().int().nonnegative(),
	DisabledG: z.number().int().nonnegative(),
	AchM: z.number().int().nonnegative(),
	AchW: z.number().int().nonnegative(),
	AchB: z.number().int().nonnegative(),
	AchG: z.number().int().nonnegative(),
	BenMSplit: z.string().regex(splitRegex, "Invalid split string format"),
	BenWSplit: z.string().regex(splitRegex, "Invalid split string format"),
	BenBSplit: z.string().regex(splitRegex, "Invalid split string format"),
	BenGSplit: z.string().regex(splitRegex, "Invalid split string format"),
	BenTotSplit: z.string().regex(splitRegex, "Invalid split string format"),
	AchMSplit: z.string().regex(splitRegex, "Invalid split string format"),
	AchWSplit: z.string().regex(splitRegex, "Invalid split string format"),
	AchBSplit: z.string().regex(splitRegex, "Invalid split string format"),
	AchGSplit: z.string().regex(splitRegex, "Invalid split string format"),
	AchTotSplit: z.string().regex(splitRegex, "Invalid split string format"),
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
	GlobalInstanceStatusId: z.number().int().nonnegative(),
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
	PlannedStartDate: z.string().regex(dateRegex, "Invalid date format"),
	PlannedEndDate: z.string().regex(dateRegex, "Invalid date format"),
	Documents: z.string(),
	PooledFundId: z.number().int().nonnegative(),
	PooledFundName: z.string(),
	AllocationYear: z.number().int().nonnegative(),
	HRPPlans: z.string(),
	AllocationHCLastProjectApprovalDate: z
		.string()
		.regex(dateRegex, "Invalid date format"),
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
	DueDiligenceStatus: z.string(),
	IsEligible: z.string(),
	EligibleSince: z.string().regex(dateRegex, "Invalid date format"),
	FirstAllocationDate: z.string().regex(dateRegex, "Invalid date format"),
	GlobalOrgId: z.number().int().nonnegative(),
	GlobalUniqueId: z.number().int().nonnegative(),
	LocalizationMarker: z.string().nullable(),
	OrgIsWLO: z.string(),
	OrgIsWRO: z.string(),
	OrgIsOPD: z.string(),
	OrgIsYLO: z.string(),
	UNPPId: z.number(),
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
