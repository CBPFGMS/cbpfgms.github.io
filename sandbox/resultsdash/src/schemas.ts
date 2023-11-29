import { z } from "zod";

const beneficiariesSchema = z.number().nullable();

export const ApprovedAllocationsObjSchema = z.object({
	AllocationYear: z.number(),
	ApprovedBudget: z.number(),
	ApprovedReserveBudget: z.number(),
	ApprovedReserveBudgetPercentage: z.number(),
	ApprovedStandardBudget: z.number(),
	ApprovedStandardBudgetPercentage: z.number(),
	FundingType: z.number(),
	OrganizationType: z.string(),
	PipelineBudget: z.number(),
	PipelineReserveBudget: z.number(),
	PipelineReserveBudgetPercentage: z.number(),
	PipelineStandardBudget: z.number(),
	PipelineStandardBudgetPercentage: z.number(),
	PooledFundName: z.string(),
	PooledFundId: z.number().optional(),
});

export const bySectorObjSchema = z.object({
	PooledFundId: z.number(),
	AllocationYear: z.number(),
	ReportApprovedDate: z.date(),
	AllocationtypeId: z.number(),
	AllocationSourceId: z.number(),
	ClusterId: z.number(),
	ClusterBudget: z.number(),
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
	PooledFundId: z.number(),
	AllocationYear: z.number(),
	ReportApprovedDate: z.date(),
	AllocationtypeId: z.number(),
	AllocationSourceId: z.number(),
	NumbofProjects: z.number(),
	TotalNumbPartners: z.number(),
	Budget: z.number(),
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
	PooledFundId: z.number(),
	AllocationYear: z.number(),
	ApprovedDate: z.date(),
	LocationID: z.number(),
	AllocationtypeId: z.number(),
	AllocationSourceId: z.number(),
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
	PooledFundId: z.number(),
	AllocationYear: z.number(),
	ReportApprovedDate: z.date(),
	BeneficiaryTypeId: z.number(),
	AllocationtypeId: z.number(),
	AllocationSourceId: z.number(),
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
	PooledFundId: z.number(),
	AllocationYear: z.number(),
	ReportApprovedDate: z.date(),
	AllocationtypeId: z.number(),
	AllocationSourceId: z.number(),
	OrganizationType: z.number(),
	NumbofProjects: z.number(),
	TotalNumbPartners: z.number(),
	Budget: z.number(),
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
