import { z } from "zod";

/*
Constants from the Master files:
These are constants coming from the master files, they are used to validate the data comming from the API. If the master files are changed, these constants should be changed as well.
*/
const numberOfFunds = 252,
	numberOfAllocationSources = 4,
	numberOfOrganizationTypes = 4,
	numberOfBeneficiaryTypes = 23,
	numberOfSectors = 17;

const beneficiariesSchema = z.number().nullable();

export const ApprovedAllocationsObjSchema = z.object({
	AllocationYear: z.number(),
	ApprovedBudget: z.number().min(0),
	ApprovedReserveBudget: z.number().min(0),
	ApprovedReserveBudgetPercentage: z.number().min(0).max(100),
	ApprovedStandardBudget: z.number().min(0),
	ApprovedStandardBudgetPercentage: z.number().min(0).max(100),
	FundingType: z.number(),
	OrganizationType: z.string(),
	PipelineBudget: z.number().min(0),
	PipelineReserveBudget: z.number().min(0),
	PipelineReserveBudgetPercentage: z.number().min(0).max(100),
	PipelineStandardBudget: z.number().min(0),
	PipelineStandardBudgetPercentage: z.number().min(0).max(100),
	PooledFundName: z.string(),
	PooledFundId: z.number().max(numberOfFunds).optional(),
});

export const bySectorObjSchema = z.object({
	PooledFundId: z.number().max(numberOfFunds),
	AllocationYear: z.number(),
	ReportApprovedDate: z.date(),
	AllocationtypeId: z.number(),
	AllocationSourceId: z.number().max(numberOfAllocationSources),
	ClusterId: z.number().max(numberOfSectors),
	ClusterBudget: z.number().min(0),
	TargetedMen: beneficiariesSchema,
	TargetedWomen: beneficiariesSchema,
	TargetedBoys: beneficiariesSchema,
	TargetedGirls: beneficiariesSchema,
	ReachedMen: beneficiariesSchema,
	ReachedWomen: beneficiariesSchema,
	ReachedBoys: beneficiariesSchema,
	ReachedGirls: beneficiariesSchema,
});

export const byDisabilityObjSchema = z.object({
	PooledFundId: z.number().max(numberOfFunds),
	AllocationYear: z.number(),
	ReportApprovedDate: z.date(),
	AllocationtypeId: z.number(),
	AllocationSourceId: z.number().max(numberOfAllocationSources),
	NumbofProjects: z.number(),
	TotalNumbPartners: z.number(),
	Budget: z.number().min(0),
	TargetedMen: beneficiariesSchema,
	TargetedWomen: beneficiariesSchema,
	TargetedBoys: beneficiariesSchema,
	TargetedGirls: beneficiariesSchema,
	ReachedMen: beneficiariesSchema,
	ReachedWomen: beneficiariesSchema,
	ReachedBoys: beneficiariesSchema,
	ReachedGirls: beneficiariesSchema,
	DisabledMen: beneficiariesSchema,
	DisabledWomen: beneficiariesSchema,
	DisabledBoys: beneficiariesSchema,
	DisabledGirls: beneficiariesSchema,
	ReachedDisabledMen: beneficiariesSchema,
	ReachedDisabledWomen: beneficiariesSchema,
	ReachedDisabledBoys: beneficiariesSchema,
	ReachedDisabledGirls: beneficiariesSchema,
});

export const byLocationObjSchema = z.object({
	PooledFundId: z.number().max(numberOfFunds),
	AllocationYear: z.number(),
	ApprovedDate: z.date(),
	LocationID: z.number(),
	AllocationtypeId: z.number(),
	AllocationSourceId: z.number().max(numberOfAllocationSources),
	TargetMen: beneficiariesSchema,
	TargetWomen: beneficiariesSchema,
	TargetBoys: beneficiariesSchema,
	TargetGirls: beneficiariesSchema,
	ReachedMen: beneficiariesSchema,
	ReachedWomen: beneficiariesSchema,
	ReachedBoys: beneficiariesSchema,
	ReachedGirls: beneficiariesSchema,
});

export const byTypeObjSchema = z.object({
	PooledFundId: z.number().max(numberOfFunds),
	AllocationYear: z.number(),
	ReportApprovedDate: z.date(),
	BeneficiaryTypeId: z.number().max(numberOfBeneficiaryTypes),
	AllocationtypeId: z.number(),
	AllocationSourceId: z.number().max(numberOfAllocationSources),
	TargetMen: beneficiariesSchema,
	TargetWomen: beneficiariesSchema,
	TargetBoys: beneficiariesSchema,
	TargetGirls: beneficiariesSchema,
	ReachedMen: beneficiariesSchema,
	ReachedWomen: beneficiariesSchema,
	ReachedBoys: beneficiariesSchema,
	ReachedGirls: beneficiariesSchema,
});

export const byOrganizationObjSchema = z.object({
	PooledFundId: z.number().max(numberOfFunds),
	AllocationYear: z.number(),
	ReportApprovedDate: z.date(),
	AllocationtypeId: z.number(),
	AllocationSourceId: z.number().max(numberOfAllocationSources),
	OrganizationType: z.number().max(numberOfOrganizationTypes),
	NumbofProjects: z.number(),
	TotalNumbPartners: z.number(),
	Budget: z.number().min(0),
	TargetedMen: beneficiariesSchema,
	TargetedWomen: beneficiariesSchema,
	TargetedBoys: beneficiariesSchema,
	TargetedGirls: beneficiariesSchema,
	ReachedMen: beneficiariesSchema,
	ReachedWomen: beneficiariesSchema,
	ReachedBoys: beneficiariesSchema,
	ReachedGirls: beneficiariesSchema,
});

export type ApprovedAllocationsObj = z.infer<
	typeof ApprovedAllocationsObjSchema
>;

export type BySectorObj = z.infer<typeof bySectorObjSchema>;

export type ByDisabilityObj = z.infer<typeof byDisabilityObjSchema>;

export type ByLocationObj = z.infer<typeof byLocationObjSchema>;

export type ByTypeObj = z.infer<typeof byTypeObjSchema>;

export type ByOrganizationObj = z.infer<typeof byOrganizationObjSchema>;
