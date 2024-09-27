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

const datum = z.object({
	url: z.string().url(),
	queryString: z.string().nullable(),
	apiName: z.string(),
	charts: z.array(charts),
	apiType: apiTypes,
	date: z.date(),
	dataReceived: z.boolean(),
	downloadTime: z.number().nonnegative(),
});

export type Datum = z.infer<typeof datum>;
