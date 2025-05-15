import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import * as schema from "../db/schema";

export const ZUserInsert = createInsertSchema(schema.users, {
  email: (schema) => schema.email(),
}).pick({
  name: true,
  email: true,
});

export const ZUserSelect = createSelectSchema(schema.users, {
  id: (schema) => schema.uuid(),
  email: (schema) => schema.email(),
});

export const ZUserByIDParams = z.object({
  id: z.string().uuid(),
});
