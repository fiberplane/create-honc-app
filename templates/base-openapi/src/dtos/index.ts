import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import "zod-openapi/extend";
import * as schema from '../db/schema';

export const ZUserInsert = createInsertSchema(schema.users)
  .pick({
    name: true,
    email: true,
  })
  .openapi({
    ref: "UserInsert",
  });

export const ZUserSelect = createSelectSchema(schema.users)
  .openapi({
    ref: "UserSelect",
  });

export const ZUserByIDParams = z
  .object({
    id: z.string(),
  }).openapi({
    ref: "UserByIdParams"
  });
