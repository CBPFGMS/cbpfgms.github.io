import { z } from "zod";

//regex for the beneficiary types
const splitRegex = /^(\d*\|\d*\|\d*\|\d*\|\d*)$/;

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

export const contributionsObjectSchema = z.object({
	attributedAmount: z.number().nonnegative(),
	directAmount: z.number().nullable(),
	isPassThrough: z.boolean(),
	passedOnwardAmount: z.number().nullable(),
	pooledFundId: z.number().int().nonnegative(),
	pooledFundName: z.string().nullable(),
	retainedAmount: z.number().nullable(),
	shareOfDonorPercent: z.number().nullable(),
	shareOfFundPercent: z.number().nonnegative(),
	viaTransferAmount: z.number().nullable(),
});

export const totalBeneficiariesObjectSchema = z.object({
	PFId: z.number().int().nonnegative(),
	PFName: z.string(),
	ImplementationYear: z.number().int().nonnegative(),
	defaultAdminLevel: z.number().int().nonnegative().nullish(),
	ProcessStatus: z.string().nullable(),
	ProcessStatusId: z.number().int().nonnegative().nullable(),
	BenM: z.number().int().nonnegative().nullable(),
	BenW: z.number().int().nonnegative().nullable(),
	BenB: z.number().int().nonnegative().nullable(),
	BenG: z.number().int().nonnegative().nullable(),
	TotTarg: z.number().int().nonnegative().nullable(),
	TotProjects: z.number().int().nonnegative().nullable(),
	AchM: z.number().int().nonnegative().nullable(),
	AchW: z.number().int().nonnegative().nullable(),
	AchB: z.number().int().nonnegative().nullable(),
	AchG: z.number().int().nonnegative().nullable(),
	TotAch: z.number().int().nonnegative().nullable(),
	TotAchProjects: z.number().int().nonnegative().nullable(),
	TemplateId: z.number(),
	Steps: z.string(),
	Pcode: z.string().nullable(),
	LocPath: z.string().nullable(),
	AdminName: z.string().nullable(),
	syncedAt: z.string(),
});

export const totalBeneficiariesByPartnerObjectSchema = z.object({
	PFId: z.number().int().nonnegative(),
	PFName: z.string(),
	ImplementationYear: z.number().int().nonnegative(),
	defaultAdminLevel: z.number().int().nonnegative().nullish(),
	ProcessStatus: z.string().nullable(),
	ProcessStatusId: z.number().int().nonnegative().nullable(),
	PartnerType: z.string(),
	PartnerTypeId: z.number().int().nonnegative(),
	BenM: z.number().int().nonnegative().nullable(),
	BenW: z.number().int().nonnegative().nullable(),
	BenB: z.number().int().nonnegative().nullable(),
	BenG: z.number().int().nonnegative().nullable(),
	TotTarg: z.number().int().nonnegative().nullable(),
	TotProjects: z.number().int().nonnegative().nullable(),
	AchM: z.number().int().nonnegative().nullable(),
	AchW: z.number().int().nonnegative().nullable(),
	AchB: z.number().int().nonnegative().nullable(),
	AchG: z.number().int().nonnegative().nullable(),
	TotAch: z.number().int().nonnegative().nullable(),
	TotAchProjects: z.number().int().nonnegative().nullable(),
	TemplateId: z.number(),
	Steps: z.string(),
	Pcode: z.string().nullable(),
	LocPath: z.string().nullable(),
	AdminName: z.string().nullable(),
	syncedAt: z.string(),
});

export const totalBeneficiariesBySectorObjectSchema = z.object({
	PFId: z.number().int().nonnegative(),
	PFName: z.string(),
	ImplementationYear: z.number().int().nonnegative(),
	defaultAdminLevel: z.number().int().nonnegative().nullish(),
	ProcessStatus: z.string().nullable(),
	ProcessStatusId: z.number().int().nonnegative().nullable(),
	GlobalCluster: z.string(),
	GlobalClusterId: z.number().int().nonnegative(),
	BenM: z.number().int().nonnegative().nullable(),
	BenW: z.number().int().nonnegative().nullable(),
	BenB: z.number().int().nonnegative().nullable(),
	BenG: z.number().int().nonnegative().nullable(),
	TotTarg: z.number().int().nonnegative().nullable(),
	TotProjects: z.number().int().nonnegative().nullable(),
	AchM: z.number().int().nonnegative().nullable(),
	AchW: z.number().int().nonnegative().nullable(),
	AchB: z.number().int().nonnegative().nullable(),
	AchG: z.number().int().nonnegative().nullable(),
	TotAch: z.number().int().nonnegative().nullable(),
	TotAchProjects: z.number().int().nonnegative().nullable(),
	TemplateId: z.number(),
	Steps: z.string(),
	Pcode: z.string().nullable(),
	LocPath: z.string().nullable(),
	AdminName: z.string().nullable(),
	syncedAt: z.string(),
});

export const allocationsByYearAndFundObjectSchema = z.object({
	AllocationYear: z.number().int().nonnegative(),
	OrganizationType: z.string(),
	PooledFundName: z.string(),
	ApprovedBudget: z.number().nonnegative(),
	ApprovedReserveBudget: z.number().nonnegative().nullable(),
	ApprovedReserveBudgetPercentage: z.number().min(0).max(100).nullable(),
	ApprovedStandardBudget: z.number().nonnegative().nullable(),
	ApprovedStandardBudgetPercentage: z.number().min(0).max(100).nullable(),
	PipelineBudget: z.number().nonnegative().nullable(),
	PipelineReserveBudget: z.number().nonnegative().nullable(),
	PipelineReserveBudgetPercentage: z.number().min(0).max(100).nullable(),
	PipelineStandardBudget: z.number().nonnegative().nullable(),
	PipelineStandardBudgetPercentage: z.number().min(0).max(100).nullable(),
	FundingType: z.literal(2),
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
	GlobalOrgId: z.number().int().nonnegative().nullable(),
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
	CERFId: z.union([z.number().int().nonnegative(), z.string()]).nullable(),
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

export type ContributionsJson = {
	donors: [
		{
			attributedToDestinationFunds: number;
			contributedAmount: number;
			destinationFundCount: number;
			donorId: string;
			donorName: string;
			pooledFundCount: number;
			pooledFunds: z.infer<typeof contributionsObjectSchema>[];
		},
	];
	meta: {
		excludesUsa: boolean;
		fiscalYear: number;
	};
};

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

export type TotalBeneficiariesObject = z.infer<
	typeof totalBeneficiariesObjectSchema
>;

export type TotalBeneficiariesByPartnerObject = z.infer<
	typeof totalBeneficiariesByPartnerObjectSchema
>;

export type TotalBeneficiariesBySectorObject = z.infer<
	typeof totalBeneficiariesBySectorObjectSchema
>;

export type AllocationsByYearAndFundObject = z.infer<
	typeof allocationsByYearAndFundObjectSchema
>;
