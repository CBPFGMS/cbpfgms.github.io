import { z } from "zod";

const charts = z.enum([
	"Allocations_overview",
	"Results_dashboard",
	"Progress_dashboard",
	"CBPF_vs_HRP",
	"CBPF_by_year",
	"Allocation_flow",
	"Allocations",
	"Allocations_timeline",
	"Contributions",
	"Contribution_trends",
	"Funding_overview",
	"Sectors",
	"Targeted_and_reached_people",
	"Gender_with_age_marker",
]);

const apiTypes = z.enum(["data", "master"]);

const datumSchema = z.object({
	url: z.string().url(),
	queryString: z.string().nullable(),
	apiName: z.string(),
	charts: z.union([z.array(charts), z.string()]),
	apiType: apiTypes,
	date: z.date(),
	dataReceived: z.boolean(),
	downloadTime: z.number().nonnegative().nullable(),
	responseTime: z.number().nonnegative().nullable(),
	totalTime: z.number().nonnegative().nullable(),
	contentSize: z.number().nonnegative().nullable(),
	error: z.string().nullable(),
});

export const dataSchema = z.array(datumSchema);

export type Datum = z.infer<typeof datumSchema>;
