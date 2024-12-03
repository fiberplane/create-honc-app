import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import * as schema from "./schema";

export const ZGaggleInsert = createInsertSchema(schema.gaggles);

export const ZGaggleSelect = createSelectSchema(schema.gaggles);

export const ZGooseInsert = createInsertSchema(schema.geese);

export const ZGooseSelect = createSelectSchema(schema.geese);

export const ZHonkInsert = createInsertSchema(schema.honks);

export const ZHonkSelect = createSelectSchema(schema.honks);
