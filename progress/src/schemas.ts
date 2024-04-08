import { z } from "zod";

/*
Constants from the Master files:
These are constants coming from the master files, they are used to validate the data coming from the API. If the master files are changed, these constants should be changed as well.
*/
const numberOfFunds = 252,
	numberOfAllocationSources = 4,
	numberOfOrganizationTypes = 4,
	numberOfBeneficiaryTypes = 23,
	numberOfSectors = 17;

export const projectSummaryObjectSchema = z.object({
	PFId: z.number(),
	AllNm: z.string(),
	PrjCode: z.string(),
	OPSCodeAgg: z.any(),
	EmgAgg: z.any(),
	AllYr: z.number(),
	AllSrc: z.number(),
	OrgNm: z.string(),
	OrgTypeId: z.number(),
	PrjTitle: z.string(),
	AStrDt: z.string(),
	AEndDt: z.string(),
	PrjDur: z.string(),
	PrgBdg: z.number(),
	BgdDC: z.number(),
	BdgSC: z.number(),
	PrjSubDt: z.string(),
	BenAgg: z.string(),
	PrjGM: z.string(),
	PrjStsNm: z.string(),
	PrjStsId: z.number(),
	PrjStsCode: z.string(),
	PartCode: z.number(),
	ApprDt: z.string(),
});

export const arQuery18ObjectSchema = z.object({
	PooledFundId: z.number(),
	PooledFundName: z.string(),
	AllocationtypeId: z.number(),
	ChfId: z.number(),
	ChfProjectCode: z.string(),
	AllocationType: z.string(),
	OrganizationName: z.string(),
	OrganizationType: z.string(),
	GlobalCluster: z.string(),
	ProjectStartDate: z.string(),
	ProjectEndDate: z.string(),
	ProjectDuration: z.string(),
	Budget: z.number(),
	Men: z.number(),
	Women: z.number(),
	Boys: z.number(),
	Girls: z.number(),
	ActualStartDate: z.string(),
	ActualEndDate: z.string(),
	AllocationSourceId: z.number(),
	AllocationYear: z.number(),
	AllocationSourceName: z.string(),
	ProjectStatus: z.string(),
	ProjectStatusId: z.number(),
	ProjectStatusCode: z.string(),
	PartnerCode: z.number(),
	ReportApprovedDate: z.string(),
	ActualMen: z.number(),
	ActualWomen: z.number(),
	ActualBoys: z.number(),
	ActualGirls: z.number(),
	ReportSubmissionDate: z.string(),
	ReportStatus: z.string(),
	ReportStatusCode: z.string(),
	TotalReached: z.number(),
	TotalReachedDisabilities: z.number(),
});

export const beneficiariesMasterObjectSchema = z.object({
	BeneficiaryTypeId: z.number(),
	BeneficiaryType: z.string(),
});

export const allocationTypeMasterObjectSchema = z.object({
	AllocationtypeId: z.number(),
	AllocationType: z.string(),
});

export const fundsMasterObjectSchema = z.object({
	id: z.number(),
	PooledFundName: z.string(),
	PooledFundNameAbbrv: z.string(),
	RegionName: z.string(),
	RegionNameArr: z.string(),
	SubRegionName: z.string(),
	ContinentName: z.string(),
	CountryCode: z.string(),
	ISO2Code: z.string(),
	latitude: z.number(),
	longitude: z.number(),
	CBPFFundStatus: z.string(),
	CBPFId: z.number(),
	CERFId: z.number(),
	AreaType: z.string(),
});

export const allocationSourcesMasterObjectSchema = z.object({
	id: z.number(),
	AllocationName: z.string(),
});

export const organizationTypesMasterObjectSchema = z.object({
	id: z.number(),
	OrganizationTypeName: z.string(),
});

export const sectorsMasterObjectSchema = z.object({
	id: z.number(),
	ClustNm: z.string(),
});

const projectSummarySchema = z.array(projectSummaryObjectSchema);

const arQuery18Schema = z.array(arQuery18ObjectSchema);

const beneficiariesMasterSchema = z.array(beneficiariesMasterObjectSchema);

const allocationTypeMasterSchema = z.array(allocationTypeMasterObjectSchema);

const fundsMasterSchema = z.array(fundsMasterObjectSchema);

const allocationSourcesMasterSchema = z.array(
	allocationSourcesMasterObjectSchema
);

const organizationTypesMasterSchema = z.array(
	organizationTypesMasterObjectSchema
);

const sectorsMasterSchema = z.array(sectorsMasterObjectSchema);

type ProjectSummaryObjectSchema = z.infer<typeof projectSummaryObjectSchema>;

type ArQuery18ObjectSchema = z.infer<typeof arQuery18ObjectSchema>;

type BeneficiariesMasterObjectSchema = z.infer<
	typeof beneficiariesMasterObjectSchema
>;

type AllocationTypeMasterObjectSchema = z.infer<
	typeof allocationTypeMasterObjectSchema
>;

type FundsMasterObjectSchema = z.infer<typeof fundsMasterObjectSchema>;

type AllocationSourcesMasterObjectSchema = z.infer<
	typeof allocationSourcesMasterObjectSchema
>;

type OrganizationTypesMasterObjectSchema = z.infer<
	typeof organizationTypesMasterObjectSchema
>;

type SectorsMasterObjectSchema = z.infer<
	typeof sectorsMasterObjectSchema
>;

export type ProjectSummary = z.infer<typeof projectSummarySchema>;

export type ArQuery18 = z.infer<typeof arQuery18Schema>;

export type BeneficiariesMaster = z.infer<typeof beneficiariesMasterSchema>;

export type AllocationTypeMaster = z.infer<typeof allocationTypeMasterSchema>;

export type FundsMaster = z.infer<typeof fundsMasterSchema>;

export type AllocationSourcesMaster = z.infer<
	typeof allocationSourcesMasterSchema
>;

export type OrganizationTypesMaster = z.infer<
	typeof organizationTypesMasterSchema
>;

export type SectorsMaster = z.infer<typeof sectorsMasterSchema>;

// const beneficiariesSchema = z.number().nullable();

// export const ApprovedAllocationsObjSchema = z.object({
// 	AllocationYear: z.number(),
// 	ApprovedBudget: z.number().min(0),
// 	ApprovedReserveBudget: z.number().min(0),
// 	ApprovedReserveBudgetPercentage: z.number().min(0).max(100),
// 	ApprovedStandardBudget: z.number().min(0),
// 	ApprovedStandardBudgetPercentage: z.number().min(0).max(100),
// 	FundingType: z.number(),
// 	OrganizationType: z.string(),
// 	PipelineBudget: z.number().min(0),
// 	PipelineReserveBudget: z.number().min(0),
// 	PipelineReserveBudgetPercentage: z.number().min(0).max(100),
// 	PipelineStandardBudget: z.number().min(0),
// 	PipelineStandardBudgetPercentage: z.number().min(0).max(100),
// 	PooledFundName: z.string(),
// 	PooledFundId: z.number().min(1).max(numberOfFunds).optional(),
// });

// export const bySectorObjSchema = z.object({
// 	PooledFundId: z.number().min(1).max(numberOfFunds),
// 	AllocationYear: z.number(),
// 	ReportApprovedDate: z.date(),
// 	AllocationtypeId: z.number(),
// 	AllocationSourceId: z.number().min(1).max(numberOfAllocationSources),
// 	ClusterId: z.number().min(1).max(numberOfSectors),
// 	ClusterBudget: z.number().min(0),
// 	TargetedMen: beneficiariesSchema,
// 	TargetedWomen: beneficiariesSchema,
// 	TargetedBoys: beneficiariesSchema,
// 	TargetedGirls: beneficiariesSchema,
// 	ReachedMen: beneficiariesSchema,
// 	ReachedWomen: beneficiariesSchema,
// 	ReachedBoys: beneficiariesSchema,
// 	ReachedGirls: beneficiariesSchema,
// });

// export const byDisabilityObjSchema = z.object({
// 	PooledFundId: z.number().min(1).max(numberOfFunds),
// 	AllocationYear: z.number(),
// 	ReportApprovedDate: z.date(),
// 	AllocationtypeId: z.number(),
// 	AllocationSourceId: z.number().min(1).max(numberOfAllocationSources),
// 	NumbofProjects: z.number(),
// 	TotalNumbPartners: z.number(),
// 	Budget: z.number().min(0),
// 	TargetedMen: beneficiariesSchema,
// 	TargetedWomen: beneficiariesSchema,
// 	TargetedBoys: beneficiariesSchema,
// 	TargetedGirls: beneficiariesSchema,
// 	ReachedMen: beneficiariesSchema,
// 	ReachedWomen: beneficiariesSchema,
// 	ReachedBoys: beneficiariesSchema,
// 	ReachedGirls: beneficiariesSchema,
// 	DisabledMen: beneficiariesSchema,
// 	DisabledWomen: beneficiariesSchema,
// 	DisabledBoys: beneficiariesSchema,
// 	DisabledGirls: beneficiariesSchema,
// 	ReachedDisabledMen: beneficiariesSchema,
// 	ReachedDisabledWomen: beneficiariesSchema,
// 	ReachedDisabledBoys: beneficiariesSchema,
// 	ReachedDisabledGirls: beneficiariesSchema,
// });

// export const byLocationObjSchema = z.object({
// 	PooledFundId: z.number().min(1).max(numberOfFunds),
// 	AllocationYear: z.number(),
// 	ApprovedDate: z.date(),
// 	LocationID: z.number(),
// 	AllocationtypeId: z.number(),
// 	AllocationSourceId: z.number().min(1).max(numberOfAllocationSources),
// 	TargetMen: beneficiariesSchema,
// 	TargetWomen: beneficiariesSchema,
// 	TargetBoys: beneficiariesSchema,
// 	TargetGirls: beneficiariesSchema,
// 	ReachedMen: beneficiariesSchema,
// 	ReachedWomen: beneficiariesSchema,
// 	ReachedBoys: beneficiariesSchema,
// 	ReachedGirls: beneficiariesSchema,
// });

// export const byTypeObjSchema = z.object({
// 	PooledFundId: z.number().min(1).max(numberOfFunds),
// 	AllocationYear: z.number(),
// 	ReportApprovedDate: z.date(),
// 	BeneficiaryTypeId: z.number().min(1).max(numberOfBeneficiaryTypes),
// 	AllocationtypeId: z.number(),
// 	AllocationSourceId: z.number().min(1).max(numberOfAllocationSources),
// 	TargetMen: beneficiariesSchema,
// 	TargetWomen: beneficiariesSchema,
// 	TargetBoys: beneficiariesSchema,
// 	TargetGirls: beneficiariesSchema,
// 	ReachedMen: beneficiariesSchema,
// 	ReachedWomen: beneficiariesSchema,
// 	ReachedBoys: beneficiariesSchema,
// 	ReachedGirls: beneficiariesSchema,
// });

// export const byOrganizationObjSchema = z.object({
// 	PooledFundId: z.number().min(1).max(numberOfFunds),
// 	AllocationYear: z.number(),
// 	ReportApprovedDate: z.date(),
// 	AllocationtypeId: z.number(),
// 	AllocationSourceId: z.number().min(1).max(numberOfAllocationSources),
// 	OrganizationType: z.number().min(1).max(numberOfOrganizationTypes),
// 	NumbofProjects: z.number(),
// 	TotalNumbPartners: z.number(),
// 	Budget: z.number().min(0),
// 	TargetedMen: beneficiariesSchema,
// 	TargetedWomen: beneficiariesSchema,
// 	TargetedBoys: beneficiariesSchema,
// 	TargetedGirls: beneficiariesSchema,
// 	ReachedMen: beneficiariesSchema,
// 	ReachedWomen: beneficiariesSchema,
// 	ReachedBoys: beneficiariesSchema,
// 	ReachedGirls: beneficiariesSchema,
// });

// export type ApprovedAllocationsObj = z.infer<
// 	typeof ApprovedAllocationsObjSchema
// >;

// export type BySectorObj = z.infer<typeof bySectorObjSchema>;

// export type ByDisabilityObj = z.infer<typeof byDisabilityObjSchema>;

// export type ByLocationObj = z.infer<typeof byLocationObjSchema>;

// export type ByTypeObj = z.infer<typeof byTypeObjSchema>;

// export type ByOrganizationObj = z.infer<typeof byOrganizationObjSchema>;
