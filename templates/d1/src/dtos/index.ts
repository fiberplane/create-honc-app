import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import * as schema from "../db/schema";

export const ZUserInsert = createInsertSchema(schema.users, {
  email: () => z.email(),
}).pick({
  name: true,
  email: true,
});

export const ZUserSelect = createSelectSchema(schema.users, {
  id: () => z.uuid(),
  email: () => z.email(),
});

export const ZUserByIDParams = z.object({
  id: z.uuid(),
});
