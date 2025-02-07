import { z } from "zod";

const datumSchema = z.object({
	id: z.number().int(),
	apiName: z.string(),
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
