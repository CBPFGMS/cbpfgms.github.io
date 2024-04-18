import { z, ZodSchema } from "zod";

/*
Constants from the Master files:
These are constants coming from the master files, they are used to validate the data coming from the API. If the master files are changed, these constants should be changed as well.
*/
// const numberOfFunds = 252,
// 	numberOfAllocationSources = 4,
// 	numberOfOrganizationTypes = 4,
// 	numberOfBeneficiaryTypes = 23,
// 	numberOfSectors = 17;

export const projectSummaryV2ObjectSchema = z.object({
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

export const sectorsDataObjectSchema = z.object({
	ChfId: z.number(),
	ChfProjectCode: z.string(),
	Percentage: z.number().min(0).max(100),
	ClusterBudget: z.number().nonnegative(),
	TarM: z.number().nullable(),
	TarW: z.number().nullable(),
	TarB: z.number().nullable(),
	TarG: z.number().nullable(),
	AchM: z.number().nullable(),
	AchW: z.number().nullable(),
	AchB: z.number().nullable(),
	AchG: z.number().nullable(),
	SectorId: z.number(),
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
	latitude: z.union([z.number(), z.literal("#N/A")]),
	longitude: z.union([z.number(), z.literal("#N/A")]),
	CBPFFundStatus: z.string(),
	CBPFId: z.union([z.number(), z.literal("")]),
	CERFId: z.union([z.number(), z.literal("")]),
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

const projectSummaryV2Schema = z.array(projectSummaryV2ObjectSchema);

const arQuery18Schema = z.array(arQuery18ObjectSchema);

const sectorsDataSchema = z.array(sectorsDataObjectSchema);

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

// type ProjectSummaryV2ObjectSchema = z.infer<
// 	typeof projectSummaryV2ObjectSchema
// >;

// type ArQuery18ObjectSchema = z.infer<typeof arQuery18ObjectSchema>;

// type BeneficiariesMasterObjectSchema = z.infer<
// 	typeof beneficiariesMasterObjectSchema
// >;

// type AllocationTypeMasterObjectSchema = z.infer<
// 	typeof allocationTypeMasterObjectSchema
// >;

// type FundsMasterObjectSchema = z.infer<typeof fundsMasterObjectSchema>;

// type AllocationSourcesMasterObjectSchema = z.infer<
// 	typeof allocationSourcesMasterObjectSchema
// >;

// type OrganizationTypesMasterObjectSchema = z.infer<
// 	typeof organizationTypesMasterObjectSchema
// >;

// type SectorsMasterObjectSchema = z.infer<typeof sectorsMasterObjectSchema>;

export type ProjectSummaryV2 = z.infer<typeof projectSummaryV2Schema>;

export type ArQuery18 = z.infer<typeof arQuery18Schema>;

export type SectorsData = z.infer<typeof sectorsDataSchema>;

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

export function createProjectSummaryV2ObjectSchema(
	numberOfFunds: number,
	numberOfAllocationSources: number,
	numberOfOrganizationTypes: number
): ZodSchema {
	return z.object({
		PFId: z.number().min(0).max(numberOfFunds),
		AllNm: z.string(),
		PrjCode: z.string(),
		OPSCodeAgg: z.any(),
		EmgAgg: z.any(),
		AllYr: z.number(),
		AllSrc: z.number().min(0).max(numberOfAllocationSources),
		OrgNm: z.string(),
		OrgTypeId: z.number().min(0).max(numberOfOrganizationTypes),
		PrjTitle: z.string(),
		AStrDt: z.string(),
		AEndDt: z.string(),
		PrjDur: z.any(),
		PrgBdg: z.number().nonnegative(),
		BgdDC: z.number().nullable(),
		BdgSC: z.number().nullable(),
		PrjSubDt: z.string(),
		BenAgg: z.string().regex(/^\d+##\d+##\d+##\d+$/),
		PrjGM: z.string().nullable(),
		PrjStsNm: z.string(),
		PrjStsId: z.number(),
		PrjStsCode: z.string(),
		PartCode: z.number().nullable(),
		ApprDt: z.string(),
	});
}
