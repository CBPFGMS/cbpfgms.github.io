import { z } from "zod";

const test = z.object({
	name: z.string(),
});

export { test };
