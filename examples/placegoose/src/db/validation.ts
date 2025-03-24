import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import * as schema from "./schema";

// This level of separation is somewhat forced at this scale.
// The decision was made for clarity, and to exclude these
// from the "schema" file export

export const ZGaggleInsert = createInsertSchema(schema.gaggles, {
  // Enhance (or override) property schemas
  name: (schema) => schema.name.min(1),
  territory: (schema) => schema.territory.min(1),
});

export const ZGaggleSelect = createSelectSchema(schema.gaggles);

export const ZGooseInsert = createInsertSchema(schema.geese, {
  name: (schema) => schema.name.min(1),
});

export const ZGooseSelect = createSelectSchema(schema.geese);

export const ZHonkInsert = createInsertSchema(schema.honks);

export const ZHonkSelect = createSelectSchema(schema.honks);
